const path = require('path');
const chalk = require('chalk');
const consoleClear = require('console-clear');
const { handleWebpackErr } = require('rax-compile-config');

const getMpOuput = require('./config/miniapp/getOutputPath');
const { WEB, WEEX, MINIAPP, KRAKEN, WECHAT_MINIPROGRAM } = require('./constants');

module.exports = ({ registerTask, context, onHook }, options = {}) => {
  const { targets = [] } = options;

  let mpBuildErr = null;

  // Use build-scripts webpack
  const buildScriptsDevTargets = [];
  // Use jsx2mp-cli webpack
  const jsx2mpDevTargets = [];

  targets.forEach(target => {
    if ([WEB, WEEX, KRAKEN].includes(target)) {
      buildScriptsDevTargets.push(target);
    } else if ([MINIAPP, WECHAT_MINIPROGRAM].includes(target)) {
      options[target] = options[target] || {};
      addMpPlatform(target, options[target]);
      if (options[target].buildType === 'runtime') {
        buildScriptsDevTargets.push(target);
      } else {
        jsx2mpDevTargets.push(target);
      }
    }
  });

  targets.forEach(async(target) => {
    if ([WEB, WEEX, KRAKEN].includes(target)) {
      const getBase = require(`./config/${target}/getBase`);
      registerTask(target, getBase(context));
    }

    if ([MINIAPP, WECHAT_MINIPROGRAM].includes(target)) {
      if (options[target] && options[target].buildType === 'runtime') {
        const getBase = require('./config/miniapp/runtime/getBase');
        registerTask(target, getBase(context, target));
      } else if (buildScriptsDevTargets.length) {
        onHook('after.build.compile', async() => {
          mpBuildErr = await invokeJSX2MPBuilder(context, options[target]);
        });
      } else if (jsx2mpDevTargets.length) {
        mpBuildErr = await invokeJSX2MPBuilder(context, options[target]);
        consoleClear(true);
        if (mpBuildErr) {
          const err = mpBuildErr.err;
          const stats = mpBuildErr.stats;
          if (!handleWebpackErr(err, stats)) {
            return;
          }
        }
        logBuildResult(targets, context);
      }
    }
  });

  onHook('after.build.compile', ({err, stats}) => {
    consoleClear(true);
    if (mpBuildErr) {
      err = mpBuildErr.err;
      stats = mpBuildErr.stats;
    }
    if (!handleWebpackErr(err, stats)) {
      return;
    }
    logBuildResult(targets, context);
  });
};

/**
 * Add mp platform
 * */
function addMpPlatform(target, originalConfig = {}) {
  switch (target) {
    case WECHAT_MINIPROGRAM:
      originalConfig.platform = 'wechat';
      break;
    default:
      break;
  }
}

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
    console.log('   ', chalk.underline.white(getMpOuput(context)));
    console.log();
  }

  if (targets.includes(WECHAT_MINIPROGRAM)) {
    console.log(chalk.green('[WeChat MiniProgram] Bundle at:'));
    console.log('   ', chalk.underline.white(getMpOuput(context, {
      platform: 'wechat',
    })));
    console.log();
  }
}

/**
 *
 * @param {*} context
 * @param {*} config
 */
async function invokeJSX2MPBuilder(context, config) {
  const jsx2mpBuilder = require('./config/miniapp/compile/build');
  const mpInfo = await jsx2mpBuilder(context, config);
  if (mpInfo.err || mpInfo.stats.hasErrors()) {
    return mpInfo;
  }
  return null;
}
