const path = require('path');
const fs = require('fs-extra');
const { formatPath } = require('@builder/app-helpers');
const setEntry = require('./setEntry');
const AppToManifestPlugin = require('./plugins/AppToManifestPlugin');

module.exports = (api) => {
  const { onGetWebpackConfig, context, registerTask, getValue } = api;
  const { rootDir } = context;
  const appWorkerPath = moduleResolve(formatPath(path.join(rootDir, './src/pha-worker')));

  onGetWebpackConfig('web', (config) => {
    config.plugin('AppToManifestPlugin').use(AppToManifestPlugin, [
      {
        api,
      },
    ]);
  });

  if (!appWorkerPath) return;

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
      appWorkerPath,
    });

    // do not copy public
    if (config.plugins.has('CopyWebpackPlugin')) {
      config.plugin('CopyWebpackPlugin').tap(() => {
        return [[]];
      });
    }
  });
};

function moduleResolve(filePath) {
  const ext = ['.ts', '.js'].find((extension) => fs.existsSync(`${filePath}${extension}`));
  if (!ext) {
    return false;
  }
  return require.resolve(`${filePath}${ext}`);
}
