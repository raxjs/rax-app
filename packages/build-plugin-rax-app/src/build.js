const path = require('path');
const chalk = require('chalk');
const consoleClear = require('console-clear');
const { handleWebpackErr } = require('rax-compile-config');
const { setConfig } = require('rax-multi-pages-settings');

const getMiniAppOutput = require('./config/miniapp/getOutputPath');
const processRelativePublicPath = require('./config/processRelativePublicPath');

const { WEB, WEEX, MINIAPP, KRAKEN, WECHAT_MINIPROGRAM } = require('./constants');

module.exports = ({ onGetWebpackConfig, registerTask, context, onHook }, options = {}) => {
  const { targets = [], type = 'spa' } = options;

  targets.forEach(async(target) => {
    // Process relative publicPath.
    onGetWebpackConfig(target, (config) => {
      // Set MPA config
      if (
        type === 'mpa'
        && (target === 'web' || target === 'weex')
      ) {
        setConfig(config, context, target);
      }
      processRelativePublicPath(target, config);
    });

    if ([WEB, WEEX, KRAKEN].includes(target)) {
      const getBase = require(`./config/${target}/getBase`);
      registerTask(target, getBase(context, target, options));
    }

    if ([MINIAPP, WECHAT_MINIPROGRAM].includes(target)) {
      if (options[target] && options[target].buildType === 'runtime') {
        const getBase = require('./config/miniapp/runtime/getBase');
        registerTask(target, getBase(context, target, options));
      } else {
        const getBase = require('./config/miniapp/compile/getBase');
        registerTask(target, getBase(context, target, options));
      }
    }
  });

  onHook('after.build.compile', ({ err, stats }) => {
    consoleClear(true);
    if (!handleWebpackErr(err, stats)) {
      return;
    }
    logBuildResult(targets, context);
  });
};

/**
 * Log build result
 * @param {array} targets
 * @param {object} context
 */
function logBuildResult(targets = [], context = {}) {
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
    console.log('   ', chalk.underline.white(getMiniAppOutput(context)));
    console.log();
  }

  if (targets.includes(WECHAT_MINIPROGRAM)) {
    console.log(chalk.green('[WeChat MiniProgram] Bundle at:'));
    console.log('   ', chalk.underline.white(getMiniAppOutput(context, {
      target: WECHAT_MINIPROGRAM,
    })));
    console.log();
  }
}
