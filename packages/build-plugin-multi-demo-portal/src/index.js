const chalk = require("chalk");
const dev = require("./dev");
const build = require("./build");

module.exports = (api, options = {}) => {
  const { command, userConfig } = api.context;

  const raxComponentPlugin = userConfig.plugins.find(
    config =>
      (Array.isArray(config) && config[0] === "build-plugin-rax-component") ||
      config === "build-plugin-rax-component",
  );

  if (!raxComponentPlugin) {
    console.error(
      chalk.red(
        "[build-plugin-rax-ui-portal] need build-plugin-rax-component to be set in build.json",
      ),
    );
    process.exit(1);
  }

  // set dev config
  if (command === "start") {
    dev(api, options);
  }

  if (command === "build") {
    build(api, options);
  }
};
