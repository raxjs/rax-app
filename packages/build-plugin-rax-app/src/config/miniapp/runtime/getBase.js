const { resolve, join } = require('path');
const MiniAppPlugin = require('rax-miniapp-runtime-webpack-plugin');
const MiniAppConfigPlugin = require('../../../../../miniapp-config-plugin');
const getWebpackBase = require('../../getWebpackBase');
const getAppConfig = require('../getAppConfig');
const setEntry = require('./setEntry');
const getMiniAppOutput = require('../getOutputPath');

module.exports = (context, target) => {
  const { rootDir } = context;
  const outputPath = getMiniAppOutput(context, { target });
  console.log('outputPath', outputPath);

  const config = getWebpackBase(context, {
    disableRegenerator: true
  });

  const appConfig = getAppConfig(context);
  setEntry(config, context, appConfig.routes);
  // Remove all app.json before it
  config.module.rule('appJSON').uses.clear();

  config.output.path(outputPath);

  config.output
    .filename('common/[name].js')
    .library('createApp')
    .libraryExport('default')
    .libraryTarget('window');

  config.module.rule('jsx')
    .use('fixRegeneratorRuntime')
    .loader(require.resolve('../../../loaders/FixRegeneratorRuntimeLoader'));


  config.externals([
    function(ctx, request, callback) {
      if (request.indexOf('@weex-module') !== -1) {
        return callback(null, 'undefined');
      }
      callback();
    },
  ]);
  config.plugin('MiniAppConfigPlugin').use(MiniAppConfigPlugin, [
    {
      type: 'runtime',
      resourcePath: join(rootDir, 'src', 'app.json'),
      outputPath,
      target
    }
  ]);

  config.plugin('MiniAppPlugin').use(MiniAppPlugin, [{ ...appConfig, target }]);

  config.devServer.writeToDisk(true).noInfo(true).inline(false);
  config.devtool('none');
  return config;
};
