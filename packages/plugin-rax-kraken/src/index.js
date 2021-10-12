const setMPAConfig = require('@builder/mpa-config');
const { getMpaEntries } = require('@builder/app-helpers');
const { isWebpack4 } = require('@builder/compat-webpack4');
const setEntry = require('./setEntry');
const { GET_RAX_APP_WEBPACK_CONFIG } = require('./constants');

module.exports = (api) => {
  const { getValue, context, registerTask, onGetWebpackConfig, registerUserConfig } = api;

  const getWebpackBase = getValue(GET_RAX_APP_WEBPACK_CONFIG);
  const tempDir = getValue('TEMP_PATH');
  const target = 'kraken';
  const chainConfig = getWebpackBase(api, {
    target,
    babelConfigOptions: { styleSheet: true },
    progressOptions: {
      name: 'Kraken',
    },
  });
  chainConfig.name(target);
  chainConfig.taskName = target;

  setEntry(chainConfig, context);

  registerTask(target, chainConfig);
  registerUserConfig({
    name: target,
    validation: 'object',
  });


  onGetWebpackConfig(target, (config) => {
    const { userConfig, command } = context;
    const krakenConfig = userConfig.kraken || {};
    const staticConfig = getValue('staticConfig');

    if (krakenConfig.mpa) {
      setMPAConfig.default(api, config, {
        type: 'kraken',
        targetDir: tempDir,
        entries: getMpaEntries(api, {
          target,
          appJsonContent: staticConfig,
        }),
      });
    }

    if (command === 'start') {
      if (isWebpack4) {
        // Force disable HMR, kraken not support yet.
        config.devServer.inline(false);
      }
      // Add webpack hot dev client
      Object.keys(config.entryPoints.entries()).forEach((entryName) => {
        config.entry(entryName).prepend(require.resolve('react-dev-utils/webpackHotDevClient'));
      });
    }
  });
};
