const ip = require('ip');
const consoleClear = require('console-clear');
const qrcode = require('qrcode-terminal');
const chalk = require('chalk');
const path = require('path');
const { handleWebpackErr } = require('rax-compile-config');
const getDemos = require('./config/getDemos');

const watchLib = require('./watchLib');
const mpDev = require('./config/miniapp/dev');

const { WEB, WEEX, MINIAPP, WECHAT_MINIPROGRAM } = require('./constants');

module.exports = (api, options = {}) => {
  const { registerTask, context, onHook } = api;
  const { rootDir, userConfig } = context;
  const { devWatchLib } = userConfig;
  const { targets = [] } = options;

  let devUrl = '';
  let devCompletedArr = [];
  const demos = getDemos(rootDir);

  const asyncTask = [];
  const selfDevTargets = [];
  const customDevTargets = [];
  // set dev config
  targets.forEach((target) => {
    if ([WEB, WEEX].indexOf(target) > -1) {
      const getDev = require(`./config/${target}/getDev`);
      const config = getDev(context, options);
      selfDevTargets.push(target);
      registerTask(`component-demo-${target}`, config);
    } else if ([MINIAPP, WECHAT_MINIPROGRAM].indexOf(target) > -1) {
      options[target] = options[target] || {};
      addMpPlatform(target, options[target]);
      if (options[target].buildType === 'runtime') {
        const getDev = require(`./config/miniapp/getDev`);
        const config = getDev(context, options, target);
        selfDevTargets.push(target);
        registerTask(`component-demo-${target}`, config);
      } else {
        customDevTargets.push(target);
      }
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

  if (devWatchLib) {
    onHook('after.start.devServer', () => {
      watchLib(api, options);
    });
  }

  onHook('after.start.compile', async (args) => {
    devUrl = args.url;
    devCompletedArr.push(args);
    // run miniapp build while targets have web or weex, for log control
    if (devCompletedArr.length === customDevTargets.length + 1) {
      devCompileLog();
    }
  });


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
      console.log(chalk.green('[Web] Development pages:'));
      demos.forEach((demo) => console.log('   ', chalk.underline.white(devUrl + demo.name)));
      console.log();
    }

    if (~targets.indexOf(WEEX)) {
      console.log(chalk.green('[Weex] Development server at:'));

      demos.forEach((demo) => {
        // Use Weex App to scan ip address (mobile phone can't visit localhost).
        const weexUrl = `${devUrl}/weex/${demo.name}.js?wh_weex=true`.replace(/^http:\/\/localhost/gi, function (match) {
          // Called when matched
          try {
            return `http://${ip.address()}`;
          } catch (error) {
            console.log(chalk.yellow(`Get local IP address failed: ${error.toString()}`));
            return match;
          }
        });
        console.log('   ', chalk.underline.white(weexUrl));
        console.log();
        qrcode.generate(weexUrl, { small: true });
        console.log();
      });
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
