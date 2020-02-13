const _ = require('lodash');
const { getWebBase } = require('build-plugin-rax-app');
const setPublicPath = require('../setPublicPath');
const getEntries = require('./getEntries');
const setUserConfig = require('../setUserConfig');

// Can‘t clone webpack chain object, so generate a new chain and reset config
module.exports = (context) => {
  const { userConfig, command } = context;

  const config = getWebBase(context);
  setUserConfig(config, context);

  if (command === 'dev') {
    setPublicPath(config);
  }

  config.entryPoints.clear();

  ['jsx', 'tsx'].forEach(tag => {
    config.module.rule(tag)
      .use('babel')
      .tap(options => {
        const res = _.cloneDeep(options);
        // transfor jsx to html for better ssr performance
        res.plugins = [
          require.resolve('babel-plugin-transform-jsx-to-html'),
          ...options.plugins,
        ];
        res.presets = options.presets.map(v => {
          if (Array.isArray(v) && v[0].indexOf('@babel/preset-env')) {
            const args = {
              ...v[1],
              targets: {
                node: '8',
              },
            };

            return [v[0], args];
          }

          return v;
        });

        return res;
      });
  });

  const entries = getEntries(config, context);
  Object.keys(entries).forEach((key) => {
    config.entry(key)
      .add(entries[key]);
  });

  config.target('node');

  ['jsx', 'tsx'].forEach(tag => {
    config.module.rule(tag)
      .use('platform')
      .options({
        platform: 'node',
      });
  });

  config.output
    .filename('node/[name].js')
    .libraryTarget('commonjs2');

  config.plugins.delete('document');
  config.plugins.delete('PWAAppShell');

  if (!userConfig.inlineStyle) {
    config.plugins.delete('minicss');
    config.module.rules.delete('css');
    config.module.rule('css')
      .test(/\.css?$/)
      .use('ignorecss')
      .loader(require.resolve('./ignoreLoader'))
      .end();
  }

  config.module.rules.delete('appJSON');

  config.externals([
    function(ctx, request, callback) {
      // Prevent bundling weex moudles
      if (request.indexOf('@weex-module') !== -1) {
        return callback(null, 'undefined');
      }
      callback();
    },
  ]);

  return config;
};
