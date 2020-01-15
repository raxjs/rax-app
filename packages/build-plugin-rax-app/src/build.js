const path = require('path');
const chalk = require('chalk');
const consoleClear = require('console-clear');
const { handleWebpackErr } = require('rax-compile-config');

const getMpOuput = require('./config/miniapp/getOutputPath');
const { WEB, WEEX, MINIAPP, KRAKEN, WECHAT_MINIPROGRAM } = require('./constants');

module.exports = ({ registerTask, context, onHook }, options = {}) => {
  const { targets = [] } = options;

  let mpBuildErr = null;

  targets.forEach(target => {
    if (target === KRAKEN || target === WEEX || target === WEB || target === WECHAT_MINIPROGRAM && options[target].buildType === 'runtime') {
      const type = target === WECHAT_MINIPROGRAM ? 'miniapp/runtime' : target;
      const getBase = require(`./config/${type}/getBase`);

      registerTask(target, getBase(context, target));
    }

    if ([MINIAPP, WECHAT_MINIPROGRAM].includes(target)) {
      const jsx2mpBuilder = require('./config/miniapp/compile/build');
      let config;
      switch (target) {
        case WECHAT_MINIPROGRAM:
          config = Object.assign({
            platform: 'wechat',
          }, options[WECHAT_MINIPROGRAM]);
          break;
        case MINIAPP:
        default:
          config = options[MINIAPP] || {};
          break;
      }
      onHook('after.build.compile', async() => {
        if (!(options[target] && options[target].buildType === 'runtime')) {
          const mpInfo = await jsx2mpBuilder(context, config);
          if (mpInfo.err || mpInfo.stats.hasErrors()) {
            mpBuildErr = mpInfo;
          }
        }
      });
    }
  });

  onHook('after.build.compile', ({ err, stats }) => {
    const { rootDir, userConfig } = context;
    const { outputDir } = userConfig;

    consoleClear(true);

    if (mpBuildErr) {
      err = mpBuildErr.err;
      stats = mpBuildErr.stats;
    }

    if (!handleWebpackErr(err, stats)) {
      return;
    }

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
      console.log(chalk.green('[Ali Miniapp] Bundle at:'));
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
  });
};
