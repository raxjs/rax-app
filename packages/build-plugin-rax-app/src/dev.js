const chalk = require('chalk');
const consoleClear = require('console-clear');
const qrcode = require('qrcode-terminal');

const { handleWebpackErr } = require('rax-compile-config');
const getMpOuput = require('./config/miniapp/getOutputPath');
const mpDev = require('./config/miniapp/compile/dev');

const { WEB, WEEX, MINIAPP, KRAKEN, WECHAT_MINIPROGRAM } = require('./constants');

const asyncTask = [];

module.exports = ({ onGetWebpackConfig, registerTask, context, onHook }, options = {}) => {
  const { targets = [] } = options;
  let devUrl = '';
  let devCompletedArr = [];
  const selfDevTargets = [];
  const customDevTargets = [];

  targets.forEach(target => {
    if ([WEB, WEEX, KRAKEN].indexOf(target) > - 1) {
      selfDevTargets.push(target);
    } else if ([MINIAPP, WECHAT_MINIPROGRAM].indexOf(target) > - 1) {
      options[target] = options[target] || {};
      addMpPlatform(target, options[target]);
      if (options[target].buildType === 'runtime') {
        selfDevTargets.push(target);
      } else {
        customDevTargets.push(target);
      }
    }
  });

  selfDevTargets.forEach(target => {
    const [getBase, setDev] = getConfig(target);
    registerTask(target, getBase(context, target));

    if (setDev) {
      onGetWebpackConfig(target, (config) => {
        setDev(config, context);
      });
    }
  });

  customDevTargets.forEach(target => {
    if (selfDevTargets.length) {
      onHook('after.start.devServer', () => {
        mpDev(context, options[target], (args) => {
          devCompletedArr.push(args);
        });
      });
    } else {
      asyncTask.push(new Promise(resolve => {
        mpDev(context, options[target], (args) => {
          devCompletedArr.push(args);
          resolve();
        });
      }));
    }
  });

  if (asyncTask.length) {
    Promise.all(asyncTask).then(() => {
      devCompileLog();
    });
  }

  onHook('after.devCompile', async (args) => {
    devUrl = args.url;
    devCompletedArr.push(args);
    // run miniapp build while targets have web or weex, for log control
    if (devCompletedArr.length === customDevTargets.length + 1) {
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

    if (targets.includes(KRAKEN)) {
      const krakenURL = `${devUrl}kraken/index.js`;
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
      console.log('   ', chalk.underline.white(getMpOuput(context, options[WECHAT_MINIPROGRAM])));
      console.log();
    }
  }
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

function getConfig(target) {
  if ([WEB, WEEX].indexOf(target) > -1) {
    return [require(`./config/${target}/getBase`), require(`./config/${target}/setDev`)];
  } else {
    return [require(`./config/miniapp/runtime/getBase`)]
  }
}
