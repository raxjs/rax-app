const webpack = require('webpack');

const MiniAppConfigPlugin = require('rax-miniapp-config-webpack-plugin');
const getWebpackBase = require('../../getWebpackBase');
const getAppConfig = require('../getAppConfig');
const setEntry = require('./setEntry');
const getOutputPath = require('../getOutputPath');

const ModifyOutputFileSystemPlugin = require('../../../plugins/ModifyOutputFileSystem');
const RuntimeWebpackPlugin = require('../../../plugins/MiniappRuntime');


const platformConfig = require('./platformConfig');
const targetPlatformMap = require('../targetPlatformMap');

const ScriptLoader = require.resolve('jsx2mp-loader/src/script-loader');
const FileLoader = require.resolve('jsx2mp-loader/src/file-loader');

module.exports = (context, target, options = {}) => {
  const { platform = targetPlatformMap[target], mode = 'build', constantDir = [], disableCopyNpm = false, turnOffSourceMap = false } = options;

  const platformInfo = platformConfig[target];
  const entryPath = './src/app.js';
  const outputPath = getOutputPath(context, { target });
  const config = getWebpackBase(context, {
    disableRegenerator: true
  });

  const appConfig = getAppConfig(context, target);

  const loaderParams = {
    mode,
    entryPath,
    outputPath,
    constantDir,
    disableCopyNpm,
    turnOffSourceMap,
    platform: platformInfo
  };

  setEntry(config, appConfig.routes, { target, loaderParams });

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

  // Remove all app.json before it
  config.module.rule('appJSON').uses.clear();

  // Exclude app.json
  config.module
    .rule('json')
    .test(/\.json$/)
    .use('script-loader')
    .loader(ScriptLoader)
    .options(loaderParams)
    .end()
    .use('json-loader')
    .loader(require.resolve('json-loader'));


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
  config.plugin('MiniAppConfigPlugin').use(MiniAppConfigPlugin, [
    {
      type: 'complie',
      appConfig,
      outputPath,
      target
    }
  ]);

  if (!disableCopyNpm) {
    config.plugin('runtime').use(RuntimeWebpackPlugin, [{ platform, mode, outputPath, rootDir: context.rootDir }]);
  }

  return config;
};
