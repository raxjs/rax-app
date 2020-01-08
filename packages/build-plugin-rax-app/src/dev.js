const ip = require('ip');
const chalk = require('chalk');
const consoleClear = require('console-clear');
const qrcode = require('qrcode-terminal');

const { handleWebpackErr } = require('rax-compile-config');
const getMpOuput = require('./config/miniapp/getOutputPath');
const mpDev = require('./config/miniapp/dev');

const { WEB, WEEX, MINIAPP, KRAKEN, WECHAT_MINIPROGRAM } = require('./constants');

module.exports = ({ onGetWebpackConfig, registerTask, context, getValue, onHook }, options = {}) => {
  const { targets = [] } = options;

  let devUrl = '';
  let devCompletedArr = [];

  if (targets.includes(MINIAPP)) {
    const config = options[MINIAPP] || {};
    if (targets.length > 2) {
      onHook('after.start.devServer', () => {
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

  if (targets.includes(WECHAT_MINIPROGRAM)) {
    const config = Object.assign({
      platform: 'wechat',
    }, options[WECHAT_MINIPROGRAM]);
    if (targets.length > 2) {
      onHook('after.start.devServer', () => {
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

      registerTask(target, getBase(context));

      onGetWebpackConfig(target, (config) => {
        setDev(config, context);
      });
    }
  });

  onHook('after.start.compile', async (args) => {
    devUrl = args.url;
    devCompletedArr.push(args);
    // run miniapp build while targets have web or weex, for log control
    if (targets.includes(MINIAPP) || targets.includes(WECHAT_MINIPROGRAM)) {
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

    // hide log in mpa
    const raxMpa = getValue('raxMpa');
    if (raxMpa) return;
    console.log(chalk.green('Rax development server has been started:'));
    console.log();

    if (targets.includes(WEB)) {
      console.log(chalk.green('[Web] Development server at:'));
      console.log('   ', chalk.underline.white(devUrl));
      console.log();
    }

    if (targets.includes(WEEX)) {
      // Use Weex App to scan ip address (mobile phone can't visit localhost).
      const weexUrl = `${devUrl}weex/index.js?wh_weex=true`.replace(/^http:\/\/localhost/gi, function (match) {
        // Called when matched
        try {
          return `http://${ip.address()}`;
        } catch (error) {
          console.log(chalk.yellow(`Get local IP address failed: ${error.toString()}`));
          return match;
        }
      });
      console.log(chalk.green('[Weex] Development server at:'));
      console.log('   ', chalk.underline.white(weexUrl));
      console.log();
      qrcode.generate(weexUrl, { small: true });
      console.log();
    }

    if (targets.includes(KRAKEN)) {
      const krakenURL = `${devUrl}kraken/index.js`;
      console.log(chalk.green('[Kraken] Development server at:'));
      console.log('   ', chalk.underline.white(krakenURL));
      console.log(chalk.green('[Kraken] Run Kraken Playground App:'));
      console.log('   ', chalk.underline.white(`kraken -u ${krakenURL}`));
      console.log();
    }

    if (targets.includes(MINIAPP)) {
      console.log(chalk.green('[Ali Miniapp] Use ali miniapp developer tools to open the following folder:'));
      console.log('   ', chalk.underline.white(getMpOuput(context)));
      console.log();
    }

    if (targets.includes(WECHAT_MINIPROGRAM)) {
      console.log(chalk.green('[WeChat MiniProgram] Use wechat miniprogram developer tools to open the following folder:'));
      console.log('   ', chalk.underline.white(getMpOuput(context, {
        platform: 'wechat',
      })));
      console.log();
    }
  }
};
