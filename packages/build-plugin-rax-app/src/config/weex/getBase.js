const WeexFrameworkBanner = require('../../plugins/WeexFrameworkBannerPlugin');
const getWebpackBase = require('../getWebpackBase');
const setEntry = require('../setEntry');
const setPlatformExtensions = require('../setPlatformExtensions');

module.exports = (context) => {
  const config = getWebpackBase(context);
  setEntry(config, context, 'weex');
  setPlatformExtensions(config, 'weex');

  config.output.filename('weex/[name].js');

  config.externals([
    function(ctx, request, callback) {
      if (request.indexOf('@weex-module') !== -1) {
        return callback(null, `commonjs ${request}`);
      }
      callback();
    },
  ]);

  config.plugin('weexFrame')
    .use(WeexFrameworkBanner);

  return config;
};
