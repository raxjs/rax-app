const ip = require('ip');
const chalk = require('chalk');
const consoleClear = require('console-clear');
const qrcode = require('qrcode-terminal');
const { setConfig, setDevLog } = require('rax-multi-pages-settings');
const { handleWebpackErr } = require('rax-compile-config');
const checkQuickAppEnv = require('rax-quickapp-webpack-plugin');
const getMiniAppOutput = require('./config/miniapp/getOutputPath');

const { WEB, WEEX, MINIAPP, KRAKEN, WECHAT_MINIPROGRAM, QUICKAPP } = require('./constants');

module.exports = ({ onGetWebpackConfig, registerTask, context, getValue, onHook }, options = {}) => {
  const { targets = [], type = 'spa' } = options;
  let devUrl = '';
  let devCompletedArr = [];

  targets.forEach((target, index) => {
    const [getBase, setDev] = getConfig(target, options);
    registerTask(target, getBase(context, target, options, onGetWebpackConfig));

    onGetWebpackConfig(target, (config) => {
      if (setDev) {
        setDev(config, context, index);
      }
      // Set MPA config
      // Should setConfig in onGetWebpackConfig method. Need to get SSR params and all build targets.
      if (
        type === 'mpa'
        && (target === 'web' || target === 'weex')
      ) {
        setConfig(config, context, targets, target);
      }
    });
  });

  onHook('after.start.compile', async(args) => {
    devUrl = args.url;
    devCompletedArr.push(args);
    devCompileLog();
    if (options[target].afterCompiled) {
      options[target].afterCompiled(args);
    }
  });

  function devCompileLog() {
    let err = devCompletedArr[0].err;
    let stats = devCompletedArr[0].stats;

    if (!handleWebpackErr(err, stats)) {
      return;
    }

    // To inform Ali Miniapp IDE to use self watch
    if (targets.includes(MINIAPP)) {
      console.log('Watching for changes...');
    }
    consoleClear(true);

    devCompletedArr.forEach((devInfo) => {
      if (devInfo.err || devInfo.stats.hasErrors()) {
        err = devInfo.err;
        stats = devInfo.stats;
      }
    });

    devCompletedArr = [];

    console.log(chalk.green('Rax development server has been started:'));
    console.log();

    // Set Web and Weex log
    if (targets.includes(WEB) || targets.includes(WEEX)) {
      if (
        type === 'mpa' ||
        // Compatibility old version build-plugin-rax-multi-pages
        getValue('raxMpa')
      ) {
        setDevLog({ url: devUrl, err, stats });
      } else {
        if (targets.includes(WEB)) {
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
      }
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
      console.log('   ', chalk.underline.white(getMiniAppOutput(context, { target: MINIAPP })));
      console.log();
    }

    if (targets.includes(WECHAT_MINIPROGRAM)) {
      console.log(chalk.green('[WeChat MiniProgram] Use wechat miniprogram developer tools to open the following folder:'));
      console.log('   ', chalk.underline.white(getMiniAppOutput(context, { target: WECHAT_MINIPROGRAM })));
      console.log();
    }

    if (targets.includes(QUICKAPP)) {
      // Check for quick app's environment
      const quickAppDist = getMiniAppOutput(context, { target: QUICKAPP });
      checkQuickAppEnv({
        workDirectory: process.cwd(),
        distDirectory: quickAppDist,
      });
      console.log(chalk.green('[Quick App] Use quick app developer tools to open the following folder:'));
      console.log('   ', chalk.underline.white(quickAppDist));
      console.log();
    }
  }
};

function getConfig(target, options = {}) {
  if ([MINIAPP, WECHAT_MINIPROGRAM, QUICKAPP].indexOf(target) > -1) {
    if (options[target] && options[target].buildType === 'runtime') {
      return [require('./config/miniapp/runtime/getBase')];
    } else {
      if (options[target]) {
        options[target].mode = 'watch';
      } else {
        options[target] = { mode: 'watch' };
      }
      return [require('./config/miniapp/compile/getBase')];
    }
  }
  return [require(`./config/${target}/getBase`), require(`./config/${target}/setDev`)];
}
