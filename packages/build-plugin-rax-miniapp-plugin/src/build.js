const path = require('path');
const chalk = require('chalk');
const consoleClear = require('console-clear');
const { handleWebpackErr } = require('rax-compile-config');

const getMiniAppOutput = require('./config/getOutputPath');

const { MINIAPP, WECHAT_MINIPROGRAM } = require('./constants');

module.exports = ({ onGetWebpackConfig, registerTask, context, onHook }, options = {}) => {
  const { targets = [] } = options;

  targets.forEach(async(target) => {
    const getBase = require('./config/getBase');
    registerTask(target, getBase(context, target, options, onGetWebpackConfig));
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

  if (targets.includes(MINIAPP)) {
    console.log(chalk.green('[Alibaba MiniApp] Plugin Bundle at:'));
    console.log('   ', chalk.underline.white(getMiniAppOutput(context, {
      target: MINIAPP,
    })));
    console.log();
  }

  if (targets.includes(WECHAT_MINIPROGRAM)) {
    console.log(chalk.green('[WeChat MiniProgram] Plugin Bundle at:'));
    console.log('   ', chalk.underline.white(getMiniAppOutput(context, {
      target: WECHAT_MINIPROGRAM,
    })));
    console.log();
  }
}
