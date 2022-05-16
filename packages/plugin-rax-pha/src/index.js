const path = require('path');
const fs = require('fs-extra');
const { formatPath } = require('@builder/app-helpers');
const AppToManifestPlugin = require('./plugins/AppToManifestPlugin');
const setRegisterMethod = require('./setRegisterMethod');
const { PHA_WORKER_ENTRY_KEY } = require('./constants');
const DeleteHotClient = require('./plugins/DeleteHotClient');

module.exports = (api) => {
  const { onGetWebpackConfig, context, registerTask, getValue } = api;
  const { rootDir, userConfig } = context;
  const appWorkerPath = moduleResolve(formatPath(path.join(rootDir, './src/pha-worker')));

  onGetWebpackConfig('web', (config) => {
    config.plugin('AppToManifestPlugin').use(AppToManifestPlugin, [
      {
        api,
        appWorkerPath,
      },
    ]);
  });

  // Set get dev url api before appWorkerPath check
  setRegisterMethod(api);
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
    const { outputDir } = userConfig;

    config.entry(PHA_WORKER_ENTRY_KEY).add(appWorkerPath);

    config.output.path(path.resolve(rootDir, outputDir, 'web')).libraryTarget('umd').globalObject('this');

    // do not copy public
    if (config.plugins.has('CopyWebpackPlugin')) {
      config.plugin('CopyWebpackPlugin').tap(() => {
        return [[]];
      });
    }

    config.plugin('DeleteHotClient').use(DeleteHotClient, [
      {
        appWorkerPath,
      },
    ]);
  });
};

function moduleResolve(filePath) {
  const ext = ['.ts', '.js'].find((extension) => fs.existsSync(`${filePath}${extension}`));
  if (!ext) {
    return false;
  }
  return require.resolve(`${filePath}${ext}`);
}
