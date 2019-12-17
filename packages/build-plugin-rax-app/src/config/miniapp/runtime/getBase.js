const getWebpackBase = require('../../getWebpackBase');
const getEntries = require('./getEntries');
const setEntry = require('./setEntry');
const KboneMpPlugin = require('../../../plugins/KboneMpPlugin');

module.exports = (context, target) => {
  const { command } = context;
  const config = getWebpackBase(context);

  const entries = getEntries(context);
  setEntry(config, context, entries);

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

  config.devServer.writeToDisk(true).noInfo(true);

  return config;
};
