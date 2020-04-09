const webpack = require('webpack');
const { resolve } = require('path');
const { existsSync } = require('fs-extra');

const getWebpackBase = require('../getBaseWebpack');
const getOutputPath = require('./getOutputPath');

const ModifyOutputFileSystemPlugin = require('../../plugins/miniapp/ModifyOutputFileSystem');
const CopyJsx2mpRuntimePlugin = require('../../plugins/miniapp/CopyJsx2mpRuntime');
const CopyPublicFilePlugin = require('../../plugins/miniapp/CopyPublicFile');


const platformConfig = require('./platformConfig');
const targetPlatformMap = require('./targetPlatformMap');

const ComponentLoader = require.resolve('jsx2mp-loader/src/component-loader');
const ScriptLoader = require.resolve('jsx2mp-loader/src/script-loader');
const FileLoader = require.resolve('jsx2mp-loader/src/file-loader');

module.exports = (context, target, options = {}, onGetWebpackConfig) => {
  const { platform = targetPlatformMap[target], mode = 'build', entryPath = './src/index', distDir = '', disableCopyNpm = false, turnOffSourceMap = false, constantDir = [] } = options[target] || {};
  const { rootDir } = context;
  const platformInfo = platformConfig[target];
  const outputPath = getOutputPath(context, { target, distDir });
  const config = getWebpackBase(context, {
    disableRegenerator: true
  });

  const isPublicFileExist = existsSync(resolve(rootDir, 'src/public'));
  const constantDirectories = isPublicFileExist ? ['src/public'].concat(constantDir) : constantDir;

  const loaderParams = {
    mode,
    entryPath,
    outputPath,
    constantDir: constantDirectories,
    disableCopyNpm,
    turnOffSourceMap,
    platform: platformInfo
  };

  config.entryPoints.clear();
  config
    .entry('component')
    .add(`./${entryPath}?role=component`);

  config
    .mode('production')
    .target('node');

  config.resolve.alias
    .set('react', 'rax')
    .set('react-dom', 'rax-dom');

  onGetWebpackConfig(target, (config) => {
    const aliasEntries = config.resolve.alias.entries();
    loaderParams.aliasEntries = aliasEntries;
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
    .use('component')
    .loader(ComponentLoader)
    .options(loaderParams)
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

  if (constantDirectories.length > 0) {
    config.plugin('copyPublicFile').use(CopyPublicFilePlugin, [{ mode, outputPath, rootDir, constantDirectories }]);
  }

  if (!disableCopyNpm) {
    config.plugin('runtime').use(CopyJsx2mpRuntimePlugin, [{ platform, mode, outputPath, rootDir }]);
  }

  return config;
};
