const UniversalDocumentPlugin = require('../../plugins/UniversalDocumentPlugin');
const PWAAppShellPlugin = require('../../plugins/PWAAppShellPlugin');
const getWebpackBase = require('../getWebpackBase');
const setEntry = require('../setEntry');

module.exports = (context) => {
  const { command } = context;
  const config = getWebpackBase(context);
  setEntry(config, context, 'web');

  config.output.filename('web/[name].js');

  config.externals([
    function (ctx, request, callback) {
      if (request.indexOf('@weex-module') !== -1) {
        return callback(null, 'undefined');
      }
      callback();
    },
  ]);

  config.plugin('document')
    .use(UniversalDocumentPlugin, [{
      context,
      path: 'src/document/index.jsx',
      command,
    }]);

  config.plugin('PWAAppShell')
    .use(PWAAppShellPlugin);

  return config;
};
