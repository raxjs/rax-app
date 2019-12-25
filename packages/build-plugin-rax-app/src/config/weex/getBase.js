const WeexFrameworkBanner = require('../../plugins/WeexFrameworkBannerPlugin');
const getWebpackBase = require('../getWebpackBase');
const setEntry = require('../setEntry');

module.exports = (context) => {
  const config = getWebpackBase(context);
  setEntry(config, context, 'weex');

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

  const extensions = config.toConfig().resolve.extensions;
  config.resolve.extensions.clear();
  tenantizeExtensions('weex', extensions).forEach((ext) => {
    config.resolve.extensions.add(ext);
  });

  return config;
};
