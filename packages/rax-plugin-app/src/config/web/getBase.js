const fs = require('fs-extra');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const UniversalDocumentPlugin = require('../../plugins/UniversalDocumentPlugin');
const PWAAppShellPlugin = require('../../plugins/PWAAppShellPlugin');
const getWebpackBase = require('../getWebpackBase');
const setEntry = require('../setEntry');
const setUserConfig = require('../user/setConfig');

module.exports = (context) => {
  const { rootDir } = context;
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

  if (fs.existsSync(path.resolve(rootDir, 'src/public'))) {
    config.plugin('copyWebpackPlugin')
      .use(CopyWebpackPlugin, [[{ from: 'src/public', to: 'public' }]]);
  }

  config.plugin('document')
    .use(UniversalDocumentPlugin, [{
      path: 'src/document/index.jsx',
    }]);

  config.plugin('PWAAppShell')
    .use(PWAAppShellPlugin);

  setUserConfig(config, context, 'web');

  return config;
};
