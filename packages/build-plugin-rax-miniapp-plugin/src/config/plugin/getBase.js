const webpack = require('webpack');
const { resolve } = require('path');
const { existsSync } = require('fs-extra');

const getWebpackBase = require('./getWebpackBase');
const getPluginConfig = require('./getPluginConfig');
const setEntry = require('./setEntry');
const getOutputPath = require('./getOutputPath');

const ModifyOutputFileSystemPlugin = require('../../plugins/miniapp/ModifyOutputFileSystem');
const CopyJsx2mpRuntimePlugin = require('../../plugins/miniapp/CopyJsx2mpRuntime');
const CopyPublicFilePlugin = require('../../plugins/miniapp/CopyPublicFile');
const GenerateAppCssPlugin = require('../../plugins/miniapp/GenerateAppCss');


const platformConfig = require('./platformConfig');
const targetPlatformMap = require('./targetPlatformMap');

const PageLoader = require.resolve('jsx2mp-loader/src/page-loader');
const ComponentLoader = require.resolve('jsx2mp-loader/src/component-loader');
const ScriptLoader = require.resolve('jsx2mp-loader/src/script-loader');
const FileLoader = require.resolve('jsx2mp-loader/src/file-loader');

module.exports = (context, target, options = {}, onGetWebpackConfig) => {
  const { platform = targetPlatformMap[target], mode = 'build', disableCopyNpm = false, turnOffSourceMap = false } = options[target] || {};
  const { rootDir } = context;
  const platformInfo = platformConfig[target];
  const entryPath = './src/index.js';
  const outputPath = getOutputPath(context, { target });
  const config = getWebpackBase(context, {
    disableRegenerator: true
  });

  const pluginConfig = getPluginConfig(rootDir, target);

  const publicFilePath = resolve(rootDir, 'src/public');
  const constantDir = publicFilePath ? ['src/public'] : [];

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

  const entry = 'src/index.js';
  setEntry(config, pluginConfig, { entry });

  const pageLoaderParams = {
    ...loaderParams,
    entryPath: entry,
  };

  config
    .mode('production')
    .target('node');

  config.resolve.alias
    .set('react', 'rax')
    .set('react-dom', 'rax-dom');

  onGetWebpackConfig(target, (config) => {
    const aliasEntries = config.resolve.alias.entries();
    loaderParams.aliasEntries = pageLoaderParams.aliasEntries  = aliasEntries;
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

  config.plugin('define').use(webpack.DefinePlugin, [{
    'process.env': {
      NODE_ENV: mode === 'build' ? '"production"' : '"development"'
    }
  }]);
  config.plugin('watchIgnore').use(webpack.WatchIgnorePlugin, [[/node_modules/]]);
  config.plugin('modifyOutputFileSystem').use(ModifyOutputFileSystemPlugin);
  config.plugin('generateAppCss').use(GenerateAppCssPlugin, [{ outputPath, platformInfo }]);
  if (existsSync(publicFilePath)) {
    config.plugin('copyPublicFile').use(CopyPublicFilePlugin, [{ mode, outputPath, rootDir }]);
  }

  if (!disableCopyNpm) {
    config.plugin('runtime').use(CopyJsx2mpRuntimePlugin, [{ platform, mode, outputPath, rootDir }]);
  }

  return config;
};
