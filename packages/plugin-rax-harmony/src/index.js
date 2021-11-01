const setMPAConfig = require('@builder/mpa-config');
const { getMpaEntries } = require('@builder/app-helpers');
const setEntry = require('./setEntry');
const { GET_RAX_APP_WEBPACK_CONFIG } = require('./constants');

module.exports = (api) => {
  const { getValue, context, registerTask, onGetWebpackConfig, registerUserConfig } = api;
  const { userConfig, command } = context;

  const getWebpackBase = getValue(GET_RAX_APP_WEBPACK_CONFIG);
  const tempDir = getValue('TEMP_PATH');
  const target = 'harmony';
  const chainConfig = getWebpackBase(api, {
    target: 'harmony',
    babelConfigOptions: { styleSheet: true },
    progressOptions: {
      name: 'Harmony',
    },
  });
  chainConfig.taskName = target;

  setEntry(chainConfig, context);

  chainConfig.name(target);
  registerTask(target, chainConfig);
  registerUserConfig({
    name: target,
    validation: 'object',
  });

  onGetWebpackConfig(target, (config) => {
    const { harmony = {} } = userConfig;
    const staticConfig = getValue('staticConfig');
    // set mpa config
    if (harmony.mpa) {
      setMPAConfig.default(api, config, {
        context,
        targetDir: tempDir,
        type: 'harmony',
        entries: getMpaEntries(api, {
          target,
          appJsonContent: staticConfig,
        }),
      });
    }

    if (command === 'start') {
      // Add webpack hot dev client
      Object.keys(config.entryPoints.entries()).forEach((entryName) => {
        config.entry(entryName).prepend(require.resolve('react-dev-utils/webpackHotDevClient'));
      });
    }
  });
};
