const setMPAConfig = require('@builder/mpa-config');
const { getMpaEntries } = require('@builder/app-helpers');
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
      const webEntries = config.entryPoints.entries();
      Object.keys(webEntries).forEach((entryName) => {
        const entrySet = config.entry(entryName);
        const entryFiles = entrySet.values();
        const finalEntryFile = entryFiles[entryFiles.length - 1];
        // Add webpack hot dev client
        entrySet.prepend(require.resolve('react-dev-utils/webpackHotDevClient'));
        // Add module.hot.accept() to entry
        entrySet.add(`${require.resolve('./Loaders/hmr-loader')}!${finalEntryFile}`);
        entrySet.delete(finalEntryFile);
      });
    }
  });
};
