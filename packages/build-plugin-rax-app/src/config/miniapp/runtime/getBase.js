const path = require('path');
const MiniAppPlugin = require('rax-miniapp-runtime-webpack-plugin');
const getWebpackBase = require('../../getWebpackBase');
const getAppConfig = require('../getAppConfig');
const setEntry = require('./setEntry');

module.exports = (context, target) => {
  const { rootDir, outputDir } = context;
  const config = getWebpackBase(context, {
    disableRegenerator: true
  });

  const appConfig = getAppConfig(context);
  setEntry(config, context, appConfig.routes);

  config.output.path(path.resolve(rootDir, outputDir));
  config.output
    .filename(`${target}/common/[name].js`)
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

  config.plugin('MiniAppPlugin').use(MiniAppPlugin, [{ ...appConfig, target }]);

  config.devServer.writeToDisk(true).noInfo(true).inline(false);
  config.devtool('none');
  return config;
};
