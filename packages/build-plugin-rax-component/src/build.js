

const path = require('path');
const chalk = require('chalk');
const consoleClear = require('console-clear');

const { handleWebpackErr } = require('rax-compile-config');

const getDistConfig = require('./config/getDistConfig');
const getUMDConfig = require('./config/getUMDConfig');
const getES6Config = require('./config/getES6Config');
const getMiniappConfig = require('./config/miniapp/getBase');
const miniappPlatformConfig = require('./config/miniapp/platformConfig');
const buildLib = require('./buildLib');

const { WEB, WEEX, MINIAPP, WECHAT_MINIPROGRAM } = require('./constants');

module.exports = (api, options = {}) => {
  const { registerTask, modifyUserConfig, context, onHook, onGetWebpackConfig } = api;
  const { targets = [] } = options;
  const { rootDir, userConfig } = context;
  const { distDir, outputDir } = userConfig;

  // lib needs to be generated if targets include web/weex and `omitLib` in miniapp is false/undefined
  const generateLib = targets.includes(WEB) || targets.includes(WEEX) || !(options[MINIAPP] && options[MINIAPP].omitLib);

  targets.forEach(target => {
    if (target === WEEX || target === WEB) {
      const config = getDistConfig(context, options);
      const umdConfig = getUMDConfig(context, options);
      const es6Config = getES6Config(context, options);
      // compress and minify all files
      modifyUserConfig('outputDir', 'build');
      registerTask(`component-build-${target}`, config);
      registerTask(`component-build-${target}-umd`, umdConfig);
      registerTask(`component-build-${target}-es6`, es6Config);
    }
    if (target === MINIAPP || target === WECHAT_MINIPROGRAM) {
      options[target] = options[target] || {};
      addMiniappTargetParam(target, options[target]);
      const config = getMiniappConfig(context, target, options, onGetWebpackConfig);
      registerTask(`component-build-${target}`, config);
    }
  });

  onHook('before.build.load', async() => {
    consoleClear(true);
    if (generateLib) {
      const libBuildErr = await buildLib(api, options);

      if (libBuildErr) {
        console.error(chalk.red('Build Lib error'));
        console.log(libBuildErr.stats);
        console.log(libBuildErr.err);
      }
    }
  });

  onHook('after.build.compile', async({ err, stats }) => {
    consoleClear(true);

    if (!handleWebpackErr(err, stats)) {
      return;
    }

    console.log(chalk.green('Rax Component build finished:'));
    console.log();


    if (targets.includes(WEB) || targets.includes(WEEX)) {
      console.log(chalk.green('Component lib at:'));
      console.log('   ', chalk.underline.white(path.resolve(rootDir, outputDir)));
      console.log();

      console.log(chalk.green('Component dist at:'));
      console.log('   ', chalk.underline.white(path.resolve(rootDir, distDir)));
      console.log();
    }
    Object.entries(miniappPlatformConfig).forEach(([platform, config]) => {
      if (targets.includes(platform)) {
        console.log(chalk.green(`[${config.name}] Component lib at:`));
        const distDir = options[platform].distDir || `${outputDir}/${platform}`;
        console.log('   ', chalk.underline.white(path.resolve(rootDir, distDir)));
        console.log();
      }
    });
  });
};

/**
 * Add miniapp target param to match jsx2mp-loader config
 * */
function addMiniappTargetParam(target, originalConfig = {}) {
  switch (target) {
    case WECHAT_MINIPROGRAM:
      originalConfig.platform = 'wechat';
      break;
    default:
      break;
  }
}
