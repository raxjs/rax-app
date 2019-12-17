const getWebpackBase = require('../../getWebpackBase');
const setEntry = require('../../setEntry');
const KboneMpPlugin = require('../../../plugins/KboneMpPlugin');

module.exports = (context, target) => {
  const { command } = context;
  const config = getWebpackBase(context);
  setEntry(config, context, target);

  config.module
    .rule("entryFile")
    .test(/app\.(js|jsx|ts|tsx)$/)
    .use('wrapCreateApp')
      .loader(require.resolve('../../../loaders/KboneEntryLoader'));

  config.output
    .filename(`${target}/common/[name].js`)
    .library("createApp")
    .libraryExport("default")
    .libraryTarget("window");

  config.externals([
    function(ctx, request, callback) {
      if (request.indexOf("@weex-module") !== -1) {
        return callback(null, "undefined");
      }
      callback();
    }
  ]);

  config.plugin("MpPlugin").use(KboneMpPlugin);

  config.devServer.writeToDisk(true).noInfo(true).inline(false);

  return config;
};
