const webpack = require('webpack');
const { resolve } = require('path');
const { existsSync } = require('fs-extra');

const MiniAppConfigPlugin = require('rax-miniapp-config-webpack-plugin');
const getWebpackBase = require('../../getWebpackBase');
const getAppConfig = require('../getAppConfig');
const setEntry = require('./setEntry');
const getOutputPath = require('../getOutputPath');

const ModifyOutputFileSystemPlugin = require('../../../plugins/miniapp/ModifyOutputFileSystem');
const CopyJsx2mpRuntimePlugin = require('../../../plugins/miniapp/CopyJsx2mpRuntime');
const CopyPublicFilePlugin = require('../../../plugins/miniapp/CopyPublicFile');


const platformConfig = require('./platformConfig');
const targetPlatformMap = require('../targetPlatformMap');

const ScriptLoader = require.resolve('jsx2mp-loader/src/script-loader');
const FileLoader = require.resolve('jsx2mp-loader/src/file-loader');

module.exports = (context, target, options = {}) => {
  const { platform = targetPlatformMap[target], mode = 'build', disableCopyNpm = false, turnOffSourceMap = false } = options[target] || {};
  const { rootDir } = context;
  const platformInfo = platformConfig[target];
  const entryPath = './src/app.js';
  let outputPath = getOutputPath(context, { target });
  // Quickapp's output should be wrapped in src
  if (target === 'quickapp') {
    outputPath += '/src';
  }
  const config = getWebpackBase(context, {
    disableRegenerator: true
  });

  const appConfig = getAppConfig(rootDir, target);

  const publicFilePath = resolve(rootDir, 'src/public');
  const constantDir = publicFilePath ? ['src/public'] : [];

  const loaderParams = {
    mode,
    entryPath,
    outputPath,
    constantDir,
    disableCopyNpm,
    turnOffSourceMap,
    platform: platformInfo
  };

  setEntry(config, appConfig.routes, { loaderParams });

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
      entryPath,
      outputPath
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
      if (/^@system/.test(request)) {
        return callback(null, `commonjs2 ${request}`);
      }
      callback();
    },
  ]);

  config.plugin('define').use(webpack.DefinePlugin, [{
    'process.env': {
      NODE_ENV: mode === 'build' ? '"production"' : '"development"'
    }
  }]);
  config.plugin('watchIgnore').use(webpack.WatchIgnorePlugin, [[/node_modules/]]);
  config.plugin('modifyOutputFileSystem').use(ModifyOutputFileSystemPlugin);
  config.plugin('miniAppConfig').use(MiniAppConfigPlugin, [
    {
      type: 'complie',
      appConfig,
      getAppConfig,
      outputPath,
      target
    }
  ]);

  if (existsSync(publicFilePath)) {
    config.plugin('copyPublicFile').use(CopyPublicFilePlugin, [{ mode, outputPath, rootDir }]);
  }

  if (!disableCopyNpm) {
    config.plugin('runtime').use(CopyJsx2mpRuntimePlugin, [{ platform, mode, outputPath, rootDir }]);
  }

  return config;
};
