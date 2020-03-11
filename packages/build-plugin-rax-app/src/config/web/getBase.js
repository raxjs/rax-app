const UniversalDocumentPlugin = require('../../plugins/UniversalDocumentPlugin');
const PWAAppShellPlugin = require('../../plugins/PWAAppShellPlugin');
const getWebpackBase = require('../getWebpackBase');
const setEntry = require('../setEntry');
const { WEB } = require('../../constants');

module.exports = (context, target, options = {}) => {
  const { command } = context;
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
      path: 'src/document/index.jsx',
      doctype: options.doctype
    }]);

  config.plugin('PWAAppShell')
    .use(PWAAppShellPlugin);

  return config;
};
