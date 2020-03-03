const UniversalDocumentPlugin = require('../../plugins/UniversalDocumentPlugin');
const getWebpackBase = require('../getWebpackBase');
const setEntry = require('../setEntry');

module.exports = (context, target, options = {}) => {
  const config = getWebpackBase(context);
  setEntry(config, context, 'web');

  config.output.filename('web/[name].js');

  config.externals([
    function(ctx, request, callback) {
      if (request.indexOf('@weex-module') !== -1) {
        return callback(null, 'undefined');
      }
      callback();
    },
  ]);

  const entries = config.entryPoints.entries();
  const pages = Object.keys(entries).map(entryName => {
    return {
      entryName
    };
  });

  config.plugin('document')
    .use(UniversalDocumentPlugin, [{
      context,
      pages,
      doctype: options.doctype
    }]);

  return config;
};
