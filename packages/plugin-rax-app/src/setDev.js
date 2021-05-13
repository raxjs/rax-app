const chalk = require('chalk');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const openBrowser = require('react-dev-utils/openBrowser');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs-extra');
const chokidar = require('chokidar');
const { platformMap } = require('miniapp-builder-shared');

const logWebpackConfig = require('./utils/logWebpackConfig');
const { MINIAPP_PLATFORMS, MINIAPP, WEB, WEEX, KRAKEN, DEV_URL_PREFIX } = require('./constants');
const generateTempFile = require('./utils/generateTempFile');

const highlightPrint = chalk.hex('#F4AF3D');

function watchAppJson(rootDir, log) {
  const watcher = chokidar.watch(path.resolve(rootDir, 'src/app.json'), {
    ignoreInitial: true,
  });

  watcher.on('change', () => {
    console.log('\n');
    log.info('app.json has been changed');
    log.info('restart dev server');
    // add process env for mark restart dev process
    process.send({ type: 'RESTART_DEV' });
  });

  watcher.on('error', (error) => {
    log.error('fail to watch file', error);
    process.exit(1);
  });
}

module.exports = function (api) {
  // eslint-disable-next-line global-require
  const { context, onHook, getValue, log, applyMethod } = api;
  const { commandArgs, rootDir } = context;
  let webEntryKeys = [];
  let weexEntryKeys = [];
  let krakenEntryKeys = [];
  let webMpa = false;
  let weexMpa = false;
  let krakenMpa = false;
  let isFirstCompile = true;
  let pha = false;
  watchAppJson(rootDir, log);
  const getWebpackInfo = (configs, configName) => {
    const taskConfig = configs.find((webpackConfig) => webpackConfig.name === configName);
    if (!taskConfig) {
      return {
        entry: {},
      };
    }
    return {
      entry: taskConfig.entry || {},
      publicPath: taskConfig.output.publicPath,
    };
  };
  const devInfo = {
    urls: {},
    framework: 'rax',
  };
  onHook('before.start.run', ({ config: configs }) => {
    const { userConfig } = context;
    const webWebpackInfo = getWebpackInfo(configs, 'web');
    const weexWebpackInfo = getWebpackInfo(configs, 'weex');
    const krakenWebpackInfo = getWebpackInfo(configs, 'kraken');

    devInfo.publicPath = webWebpackInfo.publicPath;

    webEntryKeys = Object.keys(webWebpackInfo.entry);
    weexEntryKeys = Object.keys(weexWebpackInfo.entry);
    krakenEntryKeys = Object.keys(krakenWebpackInfo.entry);

    webMpa = userConfig.web && userConfig.web.mpa;
    weexMpa = userConfig.weex && userConfig.weex.mpa;
    krakenMpa = userConfig.kraken && userConfig.kraken.mpa;
    pha = userConfig.web && userConfig.web.pha;

    // Remove outputDir when start devServer
    const { outputDir = 'build' } = userConfig;
    configs.forEach((config) => {
      fs.emptyDirSync(path.resolve(rootDir, outputDir, config.name));
    });

    logWebpackConfig(configs);
  });

  onHook('after.start.compile', async ({ stats }) => {
    const statsJson = stats.toJson({
      all: false,
      errors: true,
      warnings: true,
      timings: true,
    });
    const messages = formatWebpackMessages(statsJson);
    // Do not print localUrl and assets information when containing an error
    const isSuccessful = !messages.errors.length;
    const { userConfig } = context;
    const { outputDir = 'build', targets, web = {} } = userConfig;
    const urlPrefix = getValue(DEV_URL_PREFIX);
    const showLocalUrl = !process.env.CLOUDIDE_ENV;

    if (isSuccessful) {
      if (commandArgs.enableAssets) {
        console.log(
          // eslint-disable-next-line @iceworks/best-practices/recommend-polyfill
          stats.toString({
            errors: false,
            warnings: false,
            colors: true,
            assets: true,
            chunks: false,
            entrypoints: false,
            modules: false,
            timings: false,
          }),
        );
      }

      MINIAPP_PLATFORMS.forEach((miniappPlatform) => {
        if (targets.includes(miniappPlatform)) {
          const miniappOutputPath = path.resolve(rootDir, outputDir, miniappPlatform);
          devInfo.urls[miniappPlatform === MINIAPP ? 'miniapp' : platformMap[miniappPlatform].type] = [miniappOutputPath];
          console.log(
            highlightPrint(`  [${platformMap[miniappPlatform].name}] Use ${platformMap[miniappPlatform].name.toLowerCase()} developer tools to open the following folder:`),
          );
          console.log('   ', chalk.underline.white(miniappOutputPath));
          console.log();
        }
      });

      const appConfig = getValue('staticConfig');
      const needGenerateMultipleManifest = pha && !appConfig.tabBar;
      if (targets.includes(WEB)) {
        devInfo.urls.web = [];
        console.log(highlightPrint('  [Web] Development server at: '));
        // do not open browser when restart dev
        const shouldOpenBrowser =
          !commandArgs.disableOpen && !process.env.RESTART_DEV && isFirstCompile && showLocalUrl;
        isFirstCompile = false;
        if (webEntryKeys.length > 0) {
          let openEntries = [];
          if (commandArgs.mpaEntry) {
            openEntries = commandArgs.mpaEntry.split(',');
          } else {
            openEntries.push(webEntryKeys[0]);
          }
          webEntryKeys.forEach((entryKey) => {
            const entryPath = webMpa ? `${entryKey}${web.ssr ? '' : '.html'}` : '';
            const lanUrl = `${urlPrefix}/${entryPath}`;
            devInfo.urls.web.push(lanUrl);
            console.log(`  ${chalk.underline.white(lanUrl)}`);
            if (shouldOpenBrowser && openEntries.includes(entryKey)) {
              openBrowser(lanUrl);
            }
          });
        } else {
          devInfo.urls.web.push(`${urlPrefix}/`);
          console.log(`  ${chalk.underline.white(`${urlPrefix}/`)}`);
          console.log();

          if (shouldOpenBrowser) {
            openBrowser(`${urlPrefix}/`);
          }
        }
      }

      if (targets.includes(KRAKEN)) {
        devInfo.urls.kraken = [];
        console.log(highlightPrint('  [Kraken] Development server at: '));
        krakenEntryKeys.forEach((entryKey) => {
          const krakenURL = `${urlPrefix}/kraken/${krakenMpa ? entryKey : 'index'}.js`;
          devInfo.urls.kraken.push(krakenURL);
          console.log(`  ${chalk.underline.white(krakenURL)}`);
          console.log();
        });

        console.log(highlightPrint('  [Kraken] Run Kraken Playground App: '));
        krakenEntryKeys.forEach((entryKey) => {
          const krakenURL = `${urlPrefix}/kraken/${krakenMpa ? entryKey : 'index'}.js`;
          devInfo.urls.kraken.push(krakenURL);
          console.log(`  ${chalk.underline.white(`kraken ${krakenURL}`)}`);
          console.log();
        });
      }

      if (targets.includes(WEEX)) {
        devInfo.urls.weex = [];
        // Use Weex App to scan ip address (mobile phone can't visit localhost).
        console.log(highlightPrint('  [Weex] Development server at: '));
        weexEntryKeys.forEach((entryKey) => {
          const weexUrl = `${urlPrefix}/weex/${weexMpa ? entryKey : 'index'}.js?wh_weex=true`;
          devInfo.urls.weex.push(weexUrl);
          console.log(`  ${chalk.underline.white(weexUrl)}`);
          console.log();
          qrcode.generate(weexUrl, { small: true });
          console.log();
        });
      }

      /**
       * @TODO: Delete it first, and then open it after the PHA supports it
       */
      if (pha) {
        console.log(highlightPrint('  [PHA] Development server at: '));
        if (needGenerateMultipleManifest) {
          const devUrls = applyMethod('rax.getPHADevUrls');
          devInfo.urls.pha = devUrls;
          devUrls.forEach((url) => {
            console.log(`  ${chalk.underline.white(url)}`);
          });
          console.log();
        } else {
          // Use PHA App to scan ip address (mobile phone can't visit localhost).
          const manifestUrl = `${urlPrefix}/manifest.json?pha=true`;
          devInfo.urls.pha = [manifestUrl];
          console.log(`  ${chalk.underline.white(manifestUrl)}`);
          console.log();
          qrcode.generate(manifestUrl, { small: true });
          console.log();
        }
      }

      devInfo.compiledTime = Date.now();
      generateTempFile('dev.json', JSON.stringify(devInfo), { rootDir });
    }
  });
};
