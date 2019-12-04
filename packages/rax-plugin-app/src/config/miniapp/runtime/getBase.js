const getWebpackBase = require('../../getWebpackBase');
const setEntry = require('../../setEntry');
const setUserConfig = require('../../user/setConfig');

module.exports = (context, target) => {
  const config = getWebpackBase(context);
  setEntry(config, context, target);

  config.output.filename('web/[name].js');

  config.externals([
    function (ctx, request, callback) {
      if (request.indexOf('@weex-module') !== -1) {
        return callback(null, 'undefined');
      }
      callback();
    },
  ]);

  setUserConfig(config, context, target);
  return config;
};
