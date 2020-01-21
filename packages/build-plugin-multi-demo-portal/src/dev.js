const ip = require('ip');
const consoleClear = require('console-clear');
const chalk = require('chalk');
const { handleWebpackErr } = require('rax-compile-config');

module.exports = (api, options = {}) => {
  const { registerTask, context, onHook } = api;

  // set dev config
  const getDev = require('./config/getDev');
  const config = getDev(context, options);

  registerTask('component-multi-demo-portal', config);

  let devUrl = '';
  let devCompletedArr = [];

  function devCompileLog() {
    consoleClear(true);
    let { err, stats } = devCompletedArr[0];

    devCompletedArr.forEach(devInfo => {
      if (devInfo.err || devInfo.stats.hasErrors()) {
        err = devInfo.err;
        stats = devInfo.stats;
      }
    });

    devCompletedArr = [];

    if (!handleWebpackErr(err, stats)) {
      return;
    }

    const portalUrl = `${devUrl}portal`.replace(/^http:\/\/localhost/gi, function(match) {
      // Called when matched
      try {
        return `http://${ip.address()}`;
      } catch (error) {
        console.log(chalk.yellow(`Get local IP address failed: ${error.toString()}`));
        return match;
      }
    });

    console.log(chalk.green('Multi-page portal has been started at:'));
    console.log();
    console.log('   ', chalk.underline.white(portalUrl));
    console.log();
  }

  onHook('after.start.compile', async args => {
    devUrl = args.url;
    devCompletedArr.push(args);
    devCompileLog();
  });
};
