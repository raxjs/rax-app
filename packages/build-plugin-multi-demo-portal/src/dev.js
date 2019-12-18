const consoleClear = require("console-clear");
const chalk = require("chalk");
const { handleWebpackErr } = require("rax-compile-config");

module.exports = (api, options = {}) => {
  const { registerTask, context, onHook } = api;
  const { userConfig } = context;
  const { devWatchLib } = userConfig;

  // set dev config
  const getDev = require(`./config/getDev`);
  const config = getDev(context, options);

  registerTask(`component-multi-demo-portal`, config);

  if (devWatchLib) {
    onHook("after.start.devServer", () => {
      // watchLib(api, options);
    });
  }

  let devUrl = "";
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

    console.log(chalk.green("Multi-page portal has been started at:"));
    console.log();
    console.log("   ", chalk.underline.white(`${devUrl}portal`));
    console.log();
  }

  onHook("after.start.compile", async args => {
    devUrl = args.url;
    devCompletedArr.push(args);
    devCompileLog();
  });
};
