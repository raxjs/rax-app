const setMPAConfig = require('@builder/mpa-config');
const { getMpaEntries } = require('@builder/app-helpers');
const setEntry = require('./setEntry');
const { GET_RAX_APP_WEBPACK_CONFIG } = require('./constants');
const WeexFrameworkBannerPlugin = require('./WeexFrameworkBannerPlugin');

module.exports = (api) => {
  const { getValue, context, registerTask, onGetWebpackConfig } = api;
  const { userConfig, command } = context;

  const getWebpackBase = getValue(GET_RAX_APP_WEBPACK_CONFIG);
  const tempDir = getValue('TEMP_PATH');
  const target = 'weex';
  const chainConfig = getWebpackBase(api, {
    target: 'weex',
    babelConfigOptions: { styleSheet: true },
    progressOptions: {
      name: 'Weex',
    },
  });
  chainConfig.taskName = target;

  setEntry(chainConfig, context);

  chainConfig.plugin('WeexFrameworkBannerPlugin')
    .use(WeexFrameworkBannerPlugin);
  chainConfig.name(target);
  registerTask(target, chainConfig);

  onGetWebpackConfig(target, (config) => {
    const { weex = {} } = userConfig;
    const staticConfig = getValue('staticConfig');
    // set mpa config
    if (weex.mpa) {
      setMPAConfig.default(api, config, {
        context,
        targetDir: tempDir,
        type: 'weex',
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
