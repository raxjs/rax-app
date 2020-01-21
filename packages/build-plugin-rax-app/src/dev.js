const ip = require('ip');
const chalk = require('chalk');
const consoleClear = require('console-clear');
const qrcode = require('qrcode-terminal');

const { handleWebpackErr } = require('rax-compile-config');
const getMpOuput = require('./config/miniapp/getOutputPath');
const startJSX2MpDev = require('./config/miniapp/compile/dev');

const { WEB, WEEX, MINIAPP, KRAKEN, WECHAT_MINIPROGRAM } = require('./constants');

const asyncTask = [];

module.exports = ({ onGetWebpackConfig, registerTask, context, getValue, onHook }, options = {}) => {
  const { targets = [] } = options;
  let devUrl = '';
  let devCompletedArr = [];
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

  buildScriptsDevTargets.forEach(target => {
    const [getBase, setDev] = getConfig(target);
    registerTask(target, getBase(context, target));

    if (setDev) {
      onGetWebpackConfig(target, (config) => {
        setDev(config, context);
      });
    }
  });

  // Collect jsx2mp dev task
  jsx2mpDevTargets.forEach(target => {
    asyncTask.push(new Promise(resolve => {
      startJSX2MpDev(context, options[target], (args) => {
        devCompletedArr.push(args);
        resolve();
      });
    }));
  });

  const ONLY_MINIAPP_TARGETS = asyncTask.length && buildScriptsDevTargets.length === 0;

  if (ONLY_MINIAPP_TARGETS) {
    // Run jsx2mp dev
    Promise.all(asyncTask).then(() => {
      devCompileLog();
    });
  }

  onHook('after.start.compile', async(args) => {
    devUrl = args.url;
    devCompletedArr.push(args);
    // Run miniapp build while targets have web or weex or kraken, for log control
    if (asyncTask.length) {
      await Promise.all(asyncTask);
    }
    devCompileLog();
  });

  function devCompileLog() {
    let err = devCompletedArr[0].err;
    let stats = devCompletedArr[0].stats;

    if (!handleWebpackErr(err, stats)) {
      return;
    }

    consoleClear(true);

    devCompletedArr.forEach((devInfo) => {
      if (devInfo.err || devInfo.stats.hasErrors()) {
        err = devInfo.err;
        stats = devInfo.stats;
      }
    });

    devCompletedArr = [];

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

    if (targets.includes(WEEX)) {
      // Use Weex App to scan ip address (mobile phone can't visit localhost).
      const weexUrl = `${devUrl}weex/index.js?wh_weex=true`.replace(/^http:\/\/localhost/gi, function(match) {
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
    return [require('./config/miniapp/runtime/getBase')];
  }
}
