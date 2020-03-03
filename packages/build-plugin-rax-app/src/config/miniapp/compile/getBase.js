const webpack = require('webpack');
const getWebpackBase = require('../../getWebpackBase');
const getAppConfig = require('../getAppConfig');
const setEntry = require('./setEntry');
const getOutputPath = require('../getOutputPath');

const ModifyOutputFileSystemPlugin = require('../../../plugins/ModifyOutputFileSystem');
const RuntimeWebpackPlugin = require('../../../plugins/MiniappRuntime');


const platformConfig = require('./map/platformConfig');
const targetPlatformMap = require('./map/targetPlatformMap');

const ScriptLoader = require.resolve('jsx2mp-loader/src/script-loader');
const FileLoader = require.resolve('jsx2mp-loader/src/file-loader');

module.exports = (context, target, options = {}) => {
  const { platform = targetPlatformMap[target], mode = 'build', constantDir = [], disableCopyNpm = false, turnOffSourceMap = false } = options;

  const entryPath = './src/app.js';

  const config = getWebpackBase(context, {
    disableRegenerator: true
  });

  const appConfig = getAppConfig(context);
  setEntry(config, appConfig.routes, { platform, mode, constantDir, disableCopyNpm, turnOffSourceMap });

  const loaderParams = {
    mode,
    entryPath,
    constantDir,
    disableCopyNpm,
    turnOffSourceMap,
    platform: platformConfig[platform]
  };

  config.output.path(getOutputPath(context, { platform }));
  config
    .mode('production')
    .target('node');

  config.module.rule('jsx')
    .test(/\.t|jsx?$/)
    .use('script')
    .loader(ScriptLoader)
    .options(loaderParams);

  config.module
    .rule('staticFile')
    .test(/\.(bmp|webp|svg|png|webp|jpe?g|gif)$/i)
    .use('file')
    .loader(FileLoader)
    .options({
      entryPath
    });

  config.module.rule('appJSON').uses.clear();

  config.module
    .rule('json')
    .test(/\.json$/)
    .use('script-loader')
    .loader(ScriptLoader)
    .options(loaderParams)
    .end()
    .use('json-loader')
    .loader('json-loader');


  config.resolve.extensions
    .add('.js').add('.jsx').add('.ts').add('.tsx').add('.json');

  config.resolve.mainFields
    .add('main').add('module');

  config.externals([
    function(ctx, request, callback) {
      if (/^@core\//.test(request)) {
        return callback(null, `commonjs2 ${request}`);
      }
      if (/\.(css|sass|scss|styl|less)$/.test(request)) {
        return callback(null, `commonjs2 ${request}`);
      }
      if (/^@weex-module\//.test(request)) {
        return callback(null, `commonjs2 ${request}`);
      }
      callback();
    },
  ]);

  if (config.plugins.get('copyWebpackPlugin')) {
    config.plugin('copyWebpackPlugin')
      .tap(args => {
        args[0][0].ignore = ['*.js'];
        return args;
      });
  }


  config.plugin('define').use(webpack.DefinePlugin, [{
    'process.env': {
      NODE_ENV: mode === 'build' ? '"production"' : '"development"'
    }
  }]);
  config.plugin('watchIgnore').use(webpack.WatchIgnorePlugin, [[/node_modules/]]);
  config.plugin('modifyOutputFileSystem').use(ModifyOutputFileSystemPlugin);

  if (!disableCopyNpm) {
    config.plugin('runtime').use(RuntimeWebpackPlugin, [{ platform, mode }]);
  }

  // config.devServer.writeToDisk(true).noInfo(true).inline(false);
  // config.devtool('none');

  return config;
};
