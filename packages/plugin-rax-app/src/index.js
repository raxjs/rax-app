const path = require('path');
const { applyCliOption, applyUserConfig } = require('@builder/user-config');
const setGlobalValue = require('./utils/setGlobalValue').default;
const setTest = require('./setTest');
const setDev = require('./setDev');
const setBuild = require('./setBuild');
const customConfigs = require('./config/user.config');
const customOptionConfig = require('./config/options.config');
const modifyUserConfig = require('./utils/modifyUserConfig');
const setDevUrlPrefix = require('./utils/setDevUrlPrefix');
const setRegisterMethod = require('./utils/setRegisterMethod');
const generateTplFile = require('./generateTplFile');
const setRegisterUserConfig = require('./utils/setRegisterUserConfig').default;

module.exports = (api) => {
  const { onGetWebpackConfig, context, applyMethod, registerUserConfig } = api;
  const { command, rootDir, userConfig } = context;
  const { targets } = userConfig;

  setRegisterUserConfig(targets, registerUserConfig);
  setRegisterMethod(api);

  // set global value
  setGlobalValue(api);

  // register cli option
  applyCliOption(api, { customOptionConfig });

  // register user config
  applyUserConfig(api, { customConfigs });

  // Set dev url prefix
  setDevUrlPrefix(api);

  // modify userConfig
  modifyUserConfig(api);

  // generate template file
  generateTplFile(applyMethod);

  // Add staticConfig type
  applyMethod('addTypesExport', { source: '../plugins/rax-app/types' });

  // set webpack config
  onGetWebpackConfig((chainConfig) => {
    // add resolve modules of project node_modules
    chainConfig.resolve.modules.add(path.join(rootDir, 'node_modules'));
  });

  if (command === 'start') {
    setDev(api);
  }

  if (command === 'build') {
    setBuild(api);
  }

  if (command === 'test') {
    setTest(api);
  }
};

