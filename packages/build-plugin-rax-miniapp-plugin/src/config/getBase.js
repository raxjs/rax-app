const webpack = require('webpack');
const Chain = require('webpack-chain');
const { resolve } = require('path');
const { existsSync } = require('fs-extra');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const getPluginConfig = require('./getPluginConfig');
const setEntry = require('./setEntry');
const getOutputPath = require('./getOutputPath');

const RemoveDefaultResultPlugin = require('../plugins/miniapp/RemoveDefaultResult');
const CopyJsx2mpRuntimePlugin = require('../plugins/miniapp/CopyJsx2mpRuntime');
const CopyPublicFilePlugin = require('../plugins/miniapp/CopyPublicFile');
const ProcessPluginJsonPlugin = require('../plugins/miniapp/ProcessPluginJson');
const GenerateAppCssPlugin = require('../plugins/miniapp/GenerateAppCss');

const platformConfig = require('./platformConfig');
const targetPlatformMap = require('./targetPlatformMap');

const PageLoader = require.resolve('jsx2mp-loader/src/page-loader');
const ComponentLoader = require.resolve('jsx2mp-loader/src/component-loader');
const ScriptLoader = require.resolve('jsx2mp-loader/src/script-loader');
const FileLoader = require.resolve('jsx2mp-loader/src/file-loader');

module.exports = (context, target, options = {}, onGetWebpackConfig) => {
  const { platform = targetPlatformMap[target], mode = 'build', disableCopyNpm = false, turnOffSourceMap = false } = options[target] || {};
  const { rootDir, command } = context;
  const platformInfo = platformConfig[target];
  const entryPath = './src/index';
  const outputPath = getOutputPath(context, { target });

  const config = new Chain();

  const pluginConfig = getPluginConfig(rootDir, target);

  const isPublicFileExist = existsSync(resolve(rootDir, 'src/public'));
  const constantDir = isPublicFileExist ? ['src/public'] : [];

  const loaderParams = {
    mode,
    entryPath,
    outputPath,
    constantDir,
    disableCopyNpm,
    turnOffSourceMap,
    injectAppCssComponent: true,
    platform: platformInfo
  };
  const pageLoaderParams = {
    ...loaderParams,
    entryPath
  };


  setEntry(config, pluginConfig, { entryPath });

  config.context(rootDir);

  config.plugin('noError')
    .use(webpack.NoEmitOnErrorsPlugin);

  config.cache(true).mode('production').target('node');

  config.devServer.writeToDisk(true).noInfo(true).inline(false);

  config.resolve.alias
    .set('react', 'rax')
    .set('react-dom', 'rax-dom');

  onGetWebpackConfig(target, (config) => {
    const aliasEntries = config.resolve.alias.entries();
    loaderParams.aliasEntries = pageLoaderParams.aliasEntries = aliasEntries;
  });

  config.module.rule('jsx').uses.clear();
  config.module.rule('tsx').uses.clear();
  config.module.rule('tsx')
    .test(/\.(tsx?)$/)
    .use('ts')
    .loader(require.resolve('ts-loader'))
    .options({
      transpileOnly: true,
    });


  // Remove all app.json before it
  config.module.rule('appJSON').uses.clear();

  config.module.rule('withRoleJSX')
    .test(/\.t|jsx?$/)
    .enforce('post')
    .exclude
    .add(/node_modules/)
    .end()
    .use('page')
    .loader(PageLoader)
    .options(pageLoaderParams)
    .end()
    .use('component')
    .loader(ComponentLoader)
    .options(pageLoaderParams)
    .end()
    .use('platform')
    .loader(require.resolve('rax-compile-config/src/platformLoader'))
    .options({platform: target})
    .end()
    .use('script')
    .loader(ScriptLoader)
    .options(loaderParams)
    .end();

  config.module.rule('npm')
    .test(/\.js$/)
    .include
    .add(/node_modules/)
    .end()
    .use('script')
    .loader(ScriptLoader)
    .options(loaderParams)
    .end();

  config.module
    .rule('staticFile')
    .test(/\.(bmp|webp|svg|png|webp|jpe?g|gif)$/i)
    .use('file')
    .loader(FileLoader)
    .options({
      entryPath,
      outputPath
    });

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
    .merge(['.js', '.json', '.jsx', '.ts', '.tsx']);


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

  config.plugin('define').use(webpack.DefinePlugin, [{
    'process.env': {
      NODE_ENV: mode === 'build' ? '"production"' : '"development"'
    }
  }]);
  config.plugin('watchIgnore').use(webpack.WatchIgnorePlugin, [[/node_modules/]]);
  config.plugin('removeDefaultResult').use(RemoveDefaultResultPlugin);
  config.plugin('processPluginJson').use(ProcessPluginJsonPlugin, [{ outputPath, rootDir, target }]);
  config.plugin('generateAppCss').use(GenerateAppCssPlugin, [{ outputPath, platformInfo }]);

  if (isPublicFileExist) {
    config.plugin('copyFile').use(CopyPublicFilePlugin, [{ mode, outputPath, rootDir }]);
  }

  // Copy src/miniapp-native dir
  if (existsSync(resolve(rootDir, 'src', 'miniapp-native'))) {
    const needCopyDirs = [{
      from: resolve(rootDir, 'src', 'miniapp-native'),
      to: resolve(outputPath, 'miniapp-native'),
    }];
    config.plugin('CopyWebpackPlugin').use(CopyWebpackPlugin, [needCopyDirs]);
  }

  if (!disableCopyNpm) {
    config.plugin('runtime').use(CopyJsx2mpRuntimePlugin, [{ platform, mode, outputPath, rootDir }]);
  }

  return config;
};
