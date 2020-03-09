const path = require('path');
const chalk = require('chalk');
const consoleClear = require('console-clear');
const { handleWebpackErr } = require('rax-compile-config');

const getMpOuput = require('./config/miniapp/getOutputPath');
const { WEB, WEEX, MINIAPP, KRAKEN, WECHAT_MINIPROGRAM } = require('./constants');

module.exports = ({ onGetWebpackConfig, registerTask, context, onHook }, options = {}) => {
  const { targets = [] } = options;

  let jsx2mpBuildErr = null;

  // Use build-scripts webpack
  const buildScriptsBuildTargets = [];
  // Use jsx2mp-cli webpack
  const jsx2mpBuildTargets = [];

  targets.forEach(target => {
    // Support publicPath use relative path.
    onGetWebpackConfig(target, (config) => {
      // Change webpack outputPath from  'xx/build'            to `xx/build/${target}`
      // Change source file's name from  `${target}/[name].js` to '[name].js'
      // After the above changes, all the asset paths are relative to the entry file (like index.html).
      const publicPath = config.output.get('publicPath');
      if (publicPath.startsWith('.')) {
        config.output.publicPath(publicPath.endsWith('/') ? publicPath : `${publicPath}/`);
        // Update output path and filename
        config.output.path(path.resolve(config.output.get('path'), target));
        config.output.filename('[name].js');
        // Update css file path
        if (config.plugins.get('minicss')) {
          config.plugin('minicss').tap((args) => args.map((arg) => {
            if (typeof arg === 'object' && arg.filename === `${target}/[name].css`) {
              return Object.assign({}, arg, { filename: '[name].css' });
            }
            return arg;
          }));
        }
      }
    });

    if ([WEB, WEEX, KRAKEN].includes(target)) {
      buildScriptsBuildTargets.push(target);
    } else if ([MINIAPP, WECHAT_MINIPROGRAM].includes(target)) {
      options[target] = options[target] || {};
      addMpPlatform(target, options[target]);
      if (options[target].buildType === 'runtime') {
        buildScriptsBuildTargets.push(target);
      } else {
        jsx2mpBuildTargets.push(target);
      }
    }
  });

  targets.forEach(async(target) => {
    if ([WEB, WEEX, KRAKEN].includes(target)) {
      const getBase = require(`./config/${target}/getBase`);
      registerTask(target, getBase(context, target, options));
    }

    if ([MINIAPP, WECHAT_MINIPROGRAM].includes(target)) {
      if (options[target] && options[target].buildType === 'runtime') {
        const getBase = require('./config/miniapp/runtime/getBase');
        registerTask(target, getBase(context, target));
      } else if (buildScriptsBuildTargets.length) {
        onHook('after.build.compile', async() => {
          jsx2mpBuildErr = await invokeJSX2MPBuilder(context, options[target]);
        });
      } else if (jsx2mpBuildTargets.length) {
        jsx2mpBuildErr = await invokeJSX2MPBuilder(context, options[target]);
        consoleClear(true);
        if (jsx2mpBuildErr) {
          const err = jsx2mpBuildErr.err;
          const stats = jsx2mpBuildErr.stats;
          if (!handleWebpackErr(err, stats)) {
            return;
          }
        }
        logBuildResult(targets, context);
      }
    }
  });

  onHook('after.build.compile', ({ err, stats }) => {
    consoleClear(true);
    if (jsx2mpBuildErr) {
      err = jsx2mpBuildErr.err;
      stats = jsx2mpBuildErr.stats;
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
  const jsx2mpBuildInfo = await jsx2mpBuilder(context, config);
  if (jsx2mpBuildInfo.err || jsx2mpBuildInfo.stats.hasErrors()) {
    return jsx2mpBuildInfo;
  }
  return null;
}
