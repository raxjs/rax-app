const path = require('path');
const { applyCliOption, applyUserConfig } = require('@builder/user-config');
const getBase = require('./base');
const { GET_RAX_APP_WEBPACK_CONFIG } = require('./constants');
const setTest = require('./setTest');
const setDev = require('./setDev');
const setBuild = require('./setBuild');
const customConfigs = require('./config/user.config');
const customOptionConfig = require('./config/options.config');
const modifyUserConfig = require('./utils/modifyUserConfig');
const setStaticConfig = require('./utils/setStaticConfig');
const setDevUrlPrefix = require('./utils/setDevUrlPrefix');
const setRegisterMethod = require('./utils/setRegisterMethod');
const generateTplFile = require('./generateTplFile');

module.exports = (api) => {
  const { onGetWebpackConfig, context, setValue, applyMethod } = api;
  const { command, rootDir } = context;

  setRegisterMethod(api);

  setValue(GET_RAX_APP_WEBPACK_CONFIG, getBase);

  setStaticConfig(api);

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

