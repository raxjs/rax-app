const MiniAppRuntimePlugin = require('rax-miniapp-runtime-webpack-plugin');
const MiniAppConfigPlugin = require('rax-miniapp-config-webpack-plugin');
const getWebpackBase = require('../../getWebpackBase');
const getAppConfig = require('../getAppConfig');
const setEntry = require('./setEntry');
const getMiniAppOutput = require('../getOutputPath');

module.exports = (context, target, options) => {
  const { rootDir, command } = context;
  const outputPath = getMiniAppOutput(context, { target });

  const config = getWebpackBase(context, {
    disableRegenerator: false
  }, target);
  const appConfig = getAppConfig(rootDir, target);
  setEntry(config, context, appConfig.routes);
  // Remove all app.json before it
  config.module.rule('appJSON').uses.clear();

  config.module
    .rule('json')
    .test(/\.json$/)
    .use('json-loader')
    .loader(require.resolve('json-loader'));

  config.output
    .filename(`${target}/common/[name].js`)
    .library('createApp')
    .libraryExport('default')
    .libraryTarget('window');

  config.module.rule('jsx')
    .use('fixRegeneratorRuntime')
    .loader(require.resolve('../../../loaders/FixRegeneratorRuntimeLoader'));

  config.plugin('MiniAppConfigPlugin').use(MiniAppConfigPlugin, [
    {
      type: 'runtime',
      appConfig,
      outputPath,
      target,
      getAppConfig
    }
  ]);
  config.plugin('MiniAppRuntimePlugin').use(MiniAppRuntimePlugin, [
    {
      ...appConfig,
      target,
      config: options[target],
      rootDir,
      command
    }
  ]);

  config.devServer.writeToDisk(true).noInfo(true).inline(false);
  config.devtool('none');
  return config;
};
