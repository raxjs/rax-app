const WeexFrameworkBanner = require('../../plugins/WeexFrameworkBannerPlugin');
const getWebpackBase = require('../getWebpackBase');
const setEntry = require('../setEntry');
const { WEEX } = require('../../constants');

module.exports = (context) => {
  const config = getWebpackBase(context, {}, WEEX);
  setEntry(config, context, WEEX);

  config.output.filename(`${WEEX}/[name].js`);

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
