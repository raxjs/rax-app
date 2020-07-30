const chalk = require('chalk');
const setUserConfig = require('./config/user/setConfig');

const build = require('./build');
const dev = require('./dev');

const pluginApp = (api, options = {}) => {
  if (typeof options.enterCheck === 'boolean' ? options.enterCheck : true) {
    enterCheck(api, options);
  }

  api.setValue('targets', options.targets);
  api.setValue('appType', options.type || 'spa');

  const { context } = api;
  const { command } = context;

  setUserConfig(api, options);

  if (command === 'build') {
    build(api, options);
  }

  if (command === 'start') {
    dev(api, options);
  }
};

function enterCheck(api, options) {
  const { context, log } = api;
  const { plugins } = context.userConfig;

  let errMsg = '';
  let hasError = false;

  const firstPluginName = Array.isArray(plugins[0]) ? plugins[0][0] : plugins[0];

  if (firstPluginName !== 'build-plugin-rax-app') {
    errMsg = 'build-plugin-rax-app must be the first plugin, please check the order of plugins';
    hasError = true;
  }

  if (!(options.targets && options.targets.length)) {
    errMsg = 'build-plugin-rax-app need to set targets, e.g. ["build-plugin-rax-app", targets: ["web", "weex"]]';
    hasError = true;
  }

  if (hasError) {
    log.error(chalk.red(errMsg));
    console.log();
    process.exit(1);
  }
}

pluginApp.getWebBase = require('./config/web/getBase');

module.exports = pluginApp;
