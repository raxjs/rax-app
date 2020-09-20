const path = require('path');
const { getWebpackConfig } = require('build-scripts-config');
const getBabelConfig = require('rax-babel-config');

module.exports = (api, { target, babelConfigOptions }) => {
  const { context } = api;
  const { command, webpack, commandArgs } = context;
  const appMode = commandArgs.mode || command;
  const babelConfig = getBabelConfig(babelConfigOptions);

  const mode = command === 'start' ? 'development' : 'production';
  const config = getWebpackConfig(mode);
  // 1M = 1024 KB = 1048576 B
  config.performance.maxAssetSize(1048576).maxEntrypointSize(1048576);

  // setup DefinePlugin, HtmlWebpackPlugin and  CopyWebpackPlugin out of onGetWebpackConfig
  // in case of registerUserConfig will be excute before onGetWebpackConfig

  // DefinePlugin
  const defineVariables = {
    'process.env.NODE_ENV': JSON.stringify(mode || 'development'),
    'process.env.APP_MODE': JSON.stringify(appMode),
    'process.env.SERVER_PORT': JSON.stringify(commandArgs.port),
  };

  config
    .plugin('SimpleProgressPlugin')
    .tap(([args]) => {
      return [
        {
          ...args,
          progressOptions: {
            clear: true,
            callback: () => {
              console.log();
            },
          },
        },
      ];
    })
    .end()
    .plugin('DefinePlugin')
    .use(webpack.DefinePlugin, [defineVariables])
    .end();

  // Process app.json file
  config.module
    .rule('appJSON')
    .type('javascript/auto')
    .test(/app\.json$/)
    .use('babel')
    .loader(require.resolve('babel-loader'))
    .options(babelConfig)
    .end()
    .use('loader')
    .loader(require.resolve('./loaders/AppConfigLoader'));

  // ReactML support
  config.module
    .rule('rml')
    .test(/\.rml$/i)
    .use('rml')
    .loader(require.resolve('@reactml/loader'))
    .options({
      renderer: 'rax',
      inlineStyle: context.userConfig.inlineStyle,
    })
    .end();

  // Externals
  config.externals([
    function(ctx, request, callback) {
      if (request.indexOf('@weex-module') !== -1) {
        return callback(null, `commonjs ${request}`);
      }
      // compatible with @system for quickapp
      if (request.indexOf('@system') !== -1) {
        return callback(null, `commonjs ${request}`);
      }
      // compatible with plugin with miniapp plugin
      if (/^plugin\:\/\//.test(request)) {
        return callback(null, `commonjs ${request}`);
      }
      callback();
    },
  ]);

  if (command === 'start') {
    // disable build-scripts stats output
    process.env.DISABLE_STATS = true;
  }

  return config;
};
