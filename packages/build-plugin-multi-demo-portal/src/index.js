const chalk = require('chalk');
const dev = require('./dev');
const build = require('./build');

module.exports = (api, options = {}) => {
  const { command, userConfig } = api.context;
  const firstPlugin = userConfig.plugins[0];
  const firstPluginName = Array.isArray(firstPlugin) ? firstPlugin[0] : firstPlugin;

  if (!/build-plugin-rax-component/.test(firstPluginName)) {
    console.error(
      chalk.red(
        '[build-plugin-multi-demo-portal] need build-plugin-rax-component to be set in build.json',
      ),
    );
    process.exit(1);
  }

  // set dev config
  if (command === 'start') {
    dev(api, options);
  }

  if (command === 'build') {
    build(api, options);
  }
};
