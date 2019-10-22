const UniversalDocumentPlugin = require('../../plugins/UniversalDocumentPlugin');
const PWAAppShellPlugin = require('../../plugins/PWAAppShellPlugin');
const getWebpackBase = require('../getWebpackBase');
const setEntry = require('../setEntry');
const setUserConfig = require('../user/setConfig');

module.exports = (context) => {
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

  ['jsx', 'tsx'].forEach(tag => {
    config.module.rule(tag)
      .use('platform')
      .options({
        platform: 'web',
      });
  });

  config.plugin('document')
    .use(UniversalDocumentPlugin, [{
      path: 'src/document/index.jsx',
    }]);

  config.plugin('PWAAppShell')
    .use(PWAAppShellPlugin);

  setUserConfig(config, context, 'web');

  return config;
};
