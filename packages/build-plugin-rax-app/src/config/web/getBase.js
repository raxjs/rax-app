const DocumentPlugin = require('../../plugins/DocumentPlugin');
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

  config.plugin('document')
    .use(DocumentPlugin, [{
      context,
      pages: {
        entryName: 'index',
        path: '/'
      },
      doctype: options.doctype
    }]);

  return config;
};
