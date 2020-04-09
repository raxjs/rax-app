const ip = require('ip');
const consoleClear = require('console-clear');
const qrcode = require('qrcode-terminal');
const chalk = require('chalk');
const path = require('path');
const { handleWebpackErr } = require('rax-compile-config');
const getDemos = require('./config/getDemos');

const watchLib = require('./watchLib');

const { WEB, WEEX, MINIAPP, WECHAT_MINIPROGRAM, NODE } = require('./constants');

module.exports = (api, options = {}) => {
  const { registerTask, context, onHook, onGetWebpackConfig } = api;
  const { rootDir, userConfig } = context;
  const { devWatchLib } = userConfig;
  const { targets = [] } = options;

  let devUrl = '';
  let devCompletedArr = [];
  const demos = getDemos(rootDir);

  // set dev config
  targets.forEach((target) => {
    if ([WEB, WEEX, NODE].indexOf(target) > -1) {
      const getDev = require(`./config/${target}/getDev`);
      const config = getDev(context, options);
      registerTask(`component-demo-${target}`, config);
    } else if ([MINIAPP, WECHAT_MINIPROGRAM].indexOf(target) > -1) {
      options[target] = options[target] || {};
      addMiniappTargetParam(target, options[target]);
      const getDev = require('./config/miniapp/getBase');
      const config = getDev(context, target, options, onGetWebpackConfig);
      registerTask(`component-demo-${target}`, config);
    }
  });

  if (devWatchLib) {
    onHook('after.start.devServer', () => {
      watchLib(api, options);
    });
  }

  onHook('after.start.compile', async(args) => {
    devUrl = args.url;
    devCompletedArr.push(args);
    devCompileLog();
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

    if (targets.includes(WEB)) {
      console.log(chalk.green('[Web] Development pages:'));
      demos.forEach((demo) => console.log('   ', chalk.underline.white(devUrl + demo.name)));
      console.log();
    }

    if (targets.includes(NODE)) {
      console.log(chalk.green('[SSR] Development pages:'));
      demos.forEach((demo) => console.log('   ', chalk.underline.white(`${devUrl}ssr/${demo.name}`)));
      console.log();
    }

    if (targets.includes(WEEX)) {
      console.log(chalk.green('[Weex] Development server at:'));

      demos.forEach((demo) => {
        // Use Weex App to scan ip address (mobile phone can't visit localhost).
        const weexUrl = `${devUrl}weex/${demo.name}.js?wh_weex=true`.replace(/^http:\/\/localhost/gi, function(match) {
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

    if (targets.includes(MINIAPP)) {
      console.log(chalk.green('[Ali Miniapp] Use ali miniapp developer tools to open the following folder:'));
      const outputPath = options[MINIAPP].distDir || `demo/${MINIAPP}`;
      console.log('   ', chalk.underline.white(path.resolve(rootDir, outputPath)));
      console.log();
    }

    if (targets.includes(WECHAT_MINIPROGRAM)) {
      console.log(chalk.green('[WeChat MiniProgram] Use wechat miniprogram developer tools to open the following folder:'));
      const outputPath = options[WECHAT_MINIPROGRAM].distDir || `demo/${WECHAT_MINIPROGRAM}`;
      console.log('   ', chalk.underline.white(path.resolve(rootDir, outputPath)));
      console.log();
    }
  }
};

/**
 * Add miniapp target param to match jsx2mp-loader config
 * */
function addMiniappTargetParam(target, originalConfig = {}) {
  switch (target) {
    case WECHAT_MINIPROGRAM:
      originalConfig.platform = 'wechat';
      break;
    default:
      break;
  }
  originalConfig.mode = 'watch';
}
