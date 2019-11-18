const consoleClear = require('console-clear');
const qrcode = require('qrcode-terminal');
const chalk = require('chalk');
const path = require('path');
const { handleWebpackErr } = require('rax-compile-config');

const watchLib = require('./watchLib');
const mpDev = require('./config/miniapp/dev');

const { WEB, WEEX, MINIAPP, WECHAT_MINIPROGRAM } = require('./contants');

module.exports = (api, options = {}) => {
  const { registerConfig, context, onHook } = api;
  const { rootDir, userConfig } = context;
  const { devWatchLib } = userConfig;
  const { targets = [] } = options;

  // set dev config
  targets.forEach(target => {
    if (target === WEEX || target === WEB) {
      const getDev = require(`./config/${target}/getDev`);
      const config = getDev(context, options);
      registerConfig('component', config);
    }
  });

  let devUrl = '';
  let devCompletedArr = [];

  function devCompileLog() {
    consoleClear(true);
    let { err, stats } = devCompletedArr[0];

    devCompletedArr.forEach((devInfo) => {
      if (devInfo.err || devInfo.stats.hasErrors()) {
        err = devInfo.err;
        stats = devInfo.stats;
      }
    });

    devCompletedArr = [];

    if (!handleWebpackErr(err, stats)) {
      return;
    }

    console.log(chalk.green('Rax development server has been started:'));
    console.log();

    if (~targets.indexOf(WEB)) {
      console.log(chalk.green('[Web] Development server at:'));
      console.log('   ', chalk.underline.white(devUrl));
      console.log();
    }

    if (~targets.indexOf(WEEX)) {
      const weexUrl = `${devUrl}/weex/index.js?wh_weex=true`;
      console.log(chalk.green('[Weex] Development server at:'));
      console.log('   ', chalk.underline.white(weexUrl));
      console.log();
      qrcode.generate(weexUrl, {small: true});
      console.log();
    }

    if (~targets.indexOf(MINIAPP)) {
      console.log(chalk.green('[Ali Miniapp] Use ali miniapp developer tools to open the following folder:'));
      console.log('   ', chalk.underline.white(path.resolve(rootDir, `demo/${MINIAPP}`)));
      console.log();
    }

    if (~targets.indexOf(WECHAT_MINIPROGRAM)) {
      console.log(chalk.green('[WeChat MiniProgram] Use wechat miniprogram developer tools to open the following folder:'));
      console.log('   ', chalk.underline.white(path.resolve(rootDir, 'demo/wechat-miniprogram')));
      console.log();
    }
  }

  if (~targets.indexOf(MINIAPP)) {
    const config = options[MINIAPP] || {};
    if (targets.length > 2) {
      onHook('after.dev', () => {
        mpDev(context, config, (args) => {
          devCompletedArr.push(args);
          if (devCompletedArr.length === 2) {
            devCompileLog();
          }
        });
      });
    } else {
      mpDev(context, config, (args) => {
        devCompletedArr.push(args);
        devCompileLog();
      });
    }
  }

  if (~targets.indexOf(WECHAT_MINIPROGRAM)) {
    const config = Object.assign({
      platform: 'wechat',
    }, options[WECHAT_MINIPROGRAM]);
    if (targets.length > 2) {
      onHook('after.dev', () => {
        mpDev(context, config, (args) => {
          devCompletedArr.push(args);
          if (devCompletedArr.length === 2) {
            devCompileLog();
          }
        });
      });
    } else {
      mpDev(context, config, (args) => {
        devCompletedArr.push(args);
        devCompileLog();
      });
    }
  }

  if (devWatchLib) {
    onHook('after.dev', () => {
      watchLib(api, options);
    });
  }

  onHook('after.devCompile', async(args) => {
    devUrl = args.url;
    devCompletedArr.push(args);
    // run miniapp build while targets have web or weex, for log control
    if (~targets.indexOf(MINIAPP) > -1 || ~targets.indexOf(WECHAT_MINIPROGRAM) > -1) {
      if (devCompletedArr.length === 2) {
        devCompileLog();
      }
    } else {
      devCompileLog();
    }
  });
};
