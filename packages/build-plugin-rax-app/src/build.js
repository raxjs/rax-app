const path = require('path');
const chalk = require('chalk');
const consoleClear = require('console-clear');
const { handleWebpackErr } = require('rax-compile-config');
const checkQuickAppEnv = require('rax-quickapp-webpack-plugin');
const { setConfig } = require('rax-multi-pages-settings');

const getMiniAppOutput = require('./config/miniapp/getOutputPath');
const processRelativePublicPath = require('./config/processRelativePublicPath');

const { WEB, WEEX, MINIAPP, KRAKEN, WECHAT_MINIPROGRAM, QUICKAPP } = require('./constants');

module.exports = ({ onGetWebpackConfig, registerTask, context, onHook }, options = {}) => {
  const { targets = [], type = 'spa' } = options;

  targets.forEach(async(target) => {
    // Process relative publicPath.
    onGetWebpackConfig(target, (config) => {
      // Set MPA config
      // Should setConfig in onGetWebpackConfig method. Need to get SSR params and all build targets.
      if (
        type === 'mpa'
        && (target === 'web' || target === 'weex')
      ) {
        setConfig(config, context, targets, target);
      }
      processRelativePublicPath(target, config);
    });

    if ([WEB, WEEX, KRAKEN].includes(target)) {
      const getBase = require(`./config/${target}/getBase`);
      registerTask(target, getBase(context, target, options));
    }

    if ([MINIAPP, WECHAT_MINIPROGRAM, QUICKAPP].includes(target)) {
      if (options[target] && options[target].buildType === 'runtime') {
        const getBase = require('./config/miniapp/runtime/getBase');
        registerTask(target, getBase(context, target, options));
      } else {
        const getBase = require('./config/miniapp/compile/getBase');
        registerTask(target, getBase(context, target, options, onGetWebpackConfig));
      }
    }
  });

  onHook('after.build.compile', ({ err, stats }) => {
    consoleClear(true);
    if (!handleWebpackErr(err, stats)) {
      return;
    }
    logBuildResult(targets, context, options);
  });
};

/**
 * Log build result
 * @param {array} targets
 * @param {object} context
 * @param {object} options
 */
function logBuildResult(targets = [], context = {}, options = {}) {
  const { rootDir, userConfig = {} } = context;
  const { outputDir } = userConfig;

  console.log(chalk.green('Rax build finished:'));
  console.log();

  if (targets.includes(WEB)) {
    console.log(chalk.green('[Web] Bundle at:'));
    console.log('   ', chalk.underline.white(path.resolve(rootDir, outputDir, WEB)));
    console.log();
  }

  if (targets.includes(WEEX)) {
    console.log(chalk.green('[Weex] Bundle at:'));
    console.log('   ', chalk.underline.white(path.resolve(rootDir, outputDir, WEEX)));
    console.log();
  }

  if (targets.includes(KRAKEN)) {
    console.log(chalk.green('[Kraken] Bundle at:'));
    console.log('   ', chalk.underline.white(path.resolve(rootDir, outputDir, KRAKEN)));
    console.log();
  }

  if (targets.includes(MINIAPP)) {
    console.log(chalk.green('[Alibaba MiniApp] Bundle at:'));
    console.log('   ', chalk.underline.white(getMiniAppOutput(context, {
      distDir: options[MINIAPP] && options[MINIAPP].distDir
    })));
    console.log();
  }

  if (targets.includes(WECHAT_MINIPROGRAM)) {
    console.log(chalk.green('[WeChat MiniProgram] Bundle at:'));
    console.log('   ', chalk.underline.white(getMiniAppOutput(context, {
      target: WECHAT_MINIPROGRAM,
      distDir: options[WECHAT_MINIPROGRAM] && options[WECHAT_MINIPROGRAM].distDir
    })));
    console.log();
  }

  if (targets.includes(QUICKAPP)) {
    // Check for quick app's environment
    const quickAppDist = getMiniAppOutput(context, { target: QUICKAPP });
    checkQuickAppEnv({
      workDirectory: process.cwd(),
      distDirectory: quickAppDist,
    });
    console.log(chalk.green('[Quick App] Use quick app developer tools to open the following folder:'));
    console.log('   ', chalk.underline.white(quickAppDist));
    console.log();
  }
}
