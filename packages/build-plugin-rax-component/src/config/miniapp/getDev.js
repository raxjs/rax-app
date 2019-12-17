const path = require('path');
const { hmrClient } = require('rax-compile-config');
const getWebpackBase = require('../getBaseWebpack');
const KboneMpPlugin = require('../../plugins/KboneMpPlugin');

module.exports = (context, target, targetName) => {
  const { rootDir } = context;
  const config = getWebpackBase(context);

  config.entry('index')
    .add(hmrClient)
    .add(path.resolve(rootDir, `demo/${targetName}/app`));

  config.module
    .rule("entryFile")
    .test(/app\.(js|jsx|ts|tsx)$/)
    .use('wrapCreateApp')
      .loader(require.resolve('../../loaders/KboneEntryLoader'));

  config.output
    .filename(`${targetName}/common/[name].js`)
    .library("createApp")
    .libraryExport("default")
    .libraryTarget("window");

  config.externals([
    function(ctx, request, callback) {
      if (request.indexOf("@weex-module") !== -1) {
        return callback(null, "undefined");
      }
      callback();
    },
  ]);

  config.plugin("MpPlugin").use(KboneMpPlugin);

  config.devServer.writeToDisk(true).noInfo(true);

  return config;
};