const path = require('path');
const chalk = require('chalk');
const consoleClear = require('console-clear');
const { handleWebpackErr } = require('rax-compile-config');

const getMpOuput = require('./config/miniapp/getOutputPath');
const { WEB, WEEX, MINIAPP, WECHAT_MINIPROGRAM } = require('./contants');

module.exports = ({ registerConfig, context, onHook }, options = {}) => {
  const { targets = [] } = options;

  let mpBuildErr = null;

  targets.forEach(target => {
    if (target === WEEX || target === WEB) {
      const getBase = require(`./config/${target}/getBase`);

      registerConfig(target, getBase(context));
    }

    if ([MINIAPP, WECHAT_MINIPROGRAM].indexOf(target) > -1) {
      const mpBuild = require('./config/miniapp/build');
      let config;
      switch(target) {
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
      onHook('after.build', async() => {
        const mpInfo = await mpBuild(context, config);
        if (mpInfo.err || mpInfo.stats.hasErrors()) {
          mpBuildErr = mpInfo;
        }
      });
    }
  });

  onHook('after.build', ({ err, stats }) => {
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

    if (~targets.indexOf(WEB)) {
      console.log(chalk.green('[Web] Bundle at:'));
      console.log('   ', chalk.underline.white(path.resolve(rootDir, outputDir, WEB)));
      console.log();
    }

    if (~targets.indexOf(WEEX)) {
      console.log(chalk.green('[Weex] Bundle at:'));
      console.log('   ', chalk.underline.white(path.resolve(rootDir, outputDir, WEEX)));
      console.log();
    }

    if (~targets.indexOf(MINIAPP)) {
      console.log(chalk.green('[Ali Miniapp] Bundle at:'));
      console.log('   ', chalk.underline.white(getMpOuput(context)));
      console.log();
    }

    if (~targets.indexOf(WECHAT_MINIPROGRAM)) {
      console.log(chalk.green('[WeChat MiniProgram] Bundle at:'));
      console.log('   ', chalk.underline.white(getMpOuput(context, {
        platform: 'wechat',
      })));
      console.log();
    }
  });
};
