const chalk = require("chalk");
const consoleClear = require("console-clear");
const { handleWebpackErr } = require("rax-compile-config");
const getDistConfig = require("./config/getDistConfig");

module.exports = (api, options = {}) => {
  const { registerTask, context, onHook } = api;

  const config = getDistConfig(context, options);

  registerTask("component-multi-demo-portal", config);

  onHook("after.build.compile", async ({ err, stats }) => {
    consoleClear(true);

    if (!handleWebpackErr(err, stats)) {
      return;
    }

    console.log(chalk.green("Portal page has been built"));
    console.log();
  });
};
