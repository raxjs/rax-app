const path = require('path');
const { applyCliOption, applyUserConfig } = require('@builder/user-config');
const getBase = require('./base');
const { GET_RAX_APP_WEBPACK_CONFIG } = require('./constants');
const setTest = require('./setTest');
const setDev = require('./setDev');
const setBuild = require('./setBuild');
const customConfigs = require('./config/user.config');
const customOptionConfig = require('./config/options.config');
const modifyTargets = require('./utils/modifyTargets');
const setStaicConfig = require('./utils/setStaticConfig');

module.exports = (api) => {
  const { onGetWebpackConfig, context, setValue } = api;
  const { command, rootDir } = context;
  setValue(GET_RAX_APP_WEBPACK_CONFIG, getBase);
  setStaicConfig(api);
  // register cli option
  applyCliOption(api, { customOptionConfig });

  // register user config
  applyUserConfig(api, { customConfigs });

  // modify targets
  modifyTargets(api);

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

