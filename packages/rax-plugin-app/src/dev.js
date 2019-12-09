const chalk = require('chalk');
const consoleClear = require('console-clear');
const qrcode = require('qrcode-terminal');

const { handleWebpackErr } = require('rax-compile-config');
const getMpOuput = require('./config/miniapp/getOutputPath');
const mpDev = require('./config/miniapp/dev');

const { WEB, WEEX, MINIAPP, KRAKEN, WECHAT_MINIPROGRAM } = require('./constants');

module.exports = ({ chainWebpack, registerConfig, context, onHook }, options = {}) => {
  const { targets = [] } = options;

  let devUrl = '';
  let devCompletedArr = [];

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

  targets.forEach(target => {
    if (target === KRAKEN || target === WEEX || target === WEB) {
      const getBase = require(`./config/${target}/getBase`);
      const setDev = require(`./config/${target}/setDev`);

      registerConfig(target, getBase(context));

      chainWebpack((config) => {
        setDev(config.getConfig(target), context);
      });
    }
  });

  onHook('after.devCompile', async (args) => {
    devUrl = args.url;
    devCompletedArr.push(args);
    // run miniapp build while targets have web or weex, for log control
    if (~targets.indexOf(MINIAPP) || ~targets.indexOf(WECHAT_MINIPROGRAM)) {
      if (devCompletedArr.length === 2) {
        devCompileLog();
      }
    } else {
      devCompileLog();
    }
  });

  function devCompileLog() {
    consoleClear(true);
    let err = devCompletedArr[0].err;
    let stats = devCompletedArr[0].stats;

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
      qrcode.generate(weexUrl, { small: true });
      console.log();
    }

    if (~targets.indexOf(KRAKEN)) {
      const krakenURL = `${devUrl}/kraken/index.js`;
      console.log(chalk.green('[Kraken] Development server at:'));
      console.log('   ', chalk.underline.white(krakenURL));
      console.log(chalk.green('[Kraken] Run Kraken Playground App:'));
      console.log('   ', chalk.underline.white(`kraken -u ${krakenURL}`));
      console.log();
    }

    if (~targets.indexOf(MINIAPP)) {
      console.log(chalk.green('[Ali Miniapp] Use ali miniapp developer tools to open the following folder:'));
      console.log('   ', chalk.underline.white(getMpOuput(context)));
      console.log();
    }

    if (~targets.indexOf(WECHAT_MINIPROGRAM)) {
      console.log(chalk.green('[WeChat MiniProgram] Use wechat miniprogram developer tools to open the following folder:'));
      console.log('   ', chalk.underline.white(getMpOuput(context, {
        platform: 'wechat',
      })));
      console.log();
    }
  }
};
