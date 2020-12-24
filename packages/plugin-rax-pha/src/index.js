const setEntry = require('./setEntry');
const AppToManifestPlugin = require('./plugins/AppToManifestPlugin');

module.exports = (api) => {
  const { onGetWebpackConfig, context, registerTask, getValue } = api;

  const getWebpackBase = getValue('getRaxAppWebpackConfig');
  const target = 'PHA';
  const chainConfig = getWebpackBase(api, {
    target,
    progressOptions: {
      name: target,
    },
  });
  chainConfig.name(target);

  registerTask(target, chainConfig);

  onGetWebpackConfig(target, (config) => {
    setEntry({
      context,
      config,
    });

    // do not copy public
    if (config.plugins.has('CopyWebpackPlugin')) {
      config.plugin('CopyWebpackPlugin').tap(() => {
        return [[]];
      });
    }
  });

  onGetWebpackConfig('web', (config) => {
    config.plugin('AppToManifestPlugin').use(AppToManifestPlugin, [
      {
        api,
      },
    ]);
  });
};
