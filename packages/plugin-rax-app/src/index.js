const path = require('path');
const { applyCliOption, applyUserConfig } = require('@builder/user-config');
const customConfigs = require('./config/user.config').default;
const customOptionConfig = require('./config/options.config');
const modifyUserConfig = require('./userConfig/modify').default;
const generateTplFile = require('./generateTplFile');
const registerCustomUserConfig = require('./userConfig/register').default;
const setupLaunch = require('./launch').default;
const setupGlobalValue = require('./global').default;

module.exports = (api) => {
  const { onGetWebpackConfig, context, applyMethod, registerUserConfig } = api;
  const { rootDir, userConfig } = context;
  const { targets } = userConfig;

  registerCustomUserConfig(targets, registerUserConfig);

  // Modify userConfig
  modifyUserConfig(api);

  // Register cli option
  applyCliOption(api, { customOptionConfig });

  // Register user config whitch the same as icejs
  applyUserConfig(api, { customConfigs });

  // Set global value and method
  setupGlobalValue(api);

  // generate template file
  generateTplFile(applyMethod);

  // Add staticConfig type
  applyMethod('addTypesExport', { source: '../plugins/app/types' });

  // set webpack config
  onGetWebpackConfig((chainConfig) => {
    // add resolve modules of project node_modules
    chainConfig.resolve.modules.add(path.join(rootDir, 'node_modules'));
  });

  setupLaunch(api);
};

