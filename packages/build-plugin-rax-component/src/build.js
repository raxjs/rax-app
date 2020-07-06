const fse = require('fs-extra');
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
  const { rootDir } = context;
  const libDir = 'lib';
  const distDir = 'dist';

  // clean build results
  fse.removeSync(path.join(rootDir, libDir));
  fse.removeSync(path.join(rootDir, distDir));
  fse.removeSync(path.join(rootDir, 'build'));
  fse.removeSync(path.join(rootDir, 'es'));

  targets.forEach(target => {
    if (target === WEEX || target === WEB) {
      const config = getDistConfig(context, options);
      const umdConfig = getUMDConfig(context, options);
      const es6Config = getES6Config(context, options);
      // compress and minify all files
      modifyUserConfig('outputDir', distDir);
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
    // start build lib&es by babel
    buildLib(api, options);
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
      console.log('   ', chalk.underline.white(path.resolve(rootDir, libDir)));
      console.log();

      console.log(chalk.green('Component dist at:'));
      console.log('   ', chalk.underline.white(path.resolve(rootDir, distDir)));
      console.log();
    }
    Object.entries(miniappPlatformConfig).forEach(([platform, config]) => {
      if (targets.includes(platform)) {
        console.log(chalk.green(`[${config.name}] Component lib at:`));
        const distDir = options[platform].distDir || `${libDir}/${platform}`;
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
