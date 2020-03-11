const DocumentPlugin = require('../../plugins/DocumentPlugin/');
const getWebpackBase = require('../getWebpackBase');
const setEntry = require('../setEntry');
const { WEB } = require('../../constants');

module.exports = (context, target, options = {}) => {
  const config = getWebpackBase(context, {}, WEB);
  setEntry(config, context, WEB);

  config.output.filename(`${WEB}/[name].js`);

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
      pages: [{
        entryName: 'index',
        path: '/'
      }],
      doctype: options.doctype,
      staticExport: options.staticExport
    }]);

  return config;
};
