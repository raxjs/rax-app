const deepmerge = require('deepmerge');
const chalk = require('chalk');

const defaultUserConfig = require('./config/user/default.config');
const build = require('./build');
const dev = require('./dev');

const pluginApp = (api, options = {}) => {
  if (!(options.targets && options.targets.length)) {
    console.error(chalk.red('rax-plugin-app need to set targets, e.g. ["rax-plugin-app", targets: ["web", "weex"]]'));
    console.log();
    process.exit(1);
  }

  const { context } = api;
  const { command } = context;
  // set default config
  context.userConfig = deepmerge(defaultUserConfig, context.userConfig);

  if (command === 'build') {
    build(api, options);
  }

  if (command === 'dev') {
    dev(api, options);
  }
};

pluginApp.getWebBase = require('./config/web/getBase');

module.exports = pluginApp;
