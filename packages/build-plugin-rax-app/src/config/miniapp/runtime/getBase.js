const MiniAppRuntimePlugin = require('rax-miniapp-runtime-webpack-plugin');
const MiniAppConfigPlugin = require('rax-miniapp-config-webpack-plugin');
const getMiniAppBabelPlugins = require('rax-miniapp-babel-plugins');
const getWebpackBase = require('../../getWebpackBase');
const getAppConfig = require('../getAppConfig');
const setEntry = require('./setEntry');
const getMiniAppOutput = require('../getOutputPath');
const filterNativePages = require('../filterNativePages');

module.exports = (context, target, options) => {
  const { rootDir, command } = context;
  const outputPath = getMiniAppOutput(context, { target });

  // Using Components
  const usingComponents = [];
  // Native lifecycle map
  const nativeLifeCycleMap = {};

  const config = getWebpackBase(context, {
    disableRegenerator: true
  }, target);
  const appConfig = getAppConfig(rootDir, target, nativeLifeCycleMap);
  appConfig.routes = filterNativePages(appConfig.routes, { rootDir, target, outputPath});
  setEntry(config, context, appConfig.routes);

  // Remove all app.json before it
  config.module.rule('appJSON').uses.clear();

  config.module
    .rule('json')
    .test(/\.json$/)
    .use('json-loader')
    .loader(require.resolve('json-loader'));

  config.output
    .filename(`${target}/common/[name].js`)
    .library('createApp')
    .libraryExport('default')
    .libraryTarget('window');

  config.module.rule('jsx')
    .use('babel')
    .tap(options => {
      options.presets = [
        ...options.presets,
        {
          plugins: getMiniAppBabelPlugins({
            usingComponents,
            nativeLifeCycleMap
          })
        }
      ];
      return options;
    });

  // Split common chunks
  config.optimization.splitChunks({
    cacheGroups: {
      commons: {
        name: 'vendor',
        chunks: 'all',
        minChunks: 2
      }
    }
  });
  // 2MB
  config.performance.maxEntrypointSize(2097152);
  // 1.5MB
  config.performance.maxAssetSize(1572864);

  config.plugin('MiniAppConfigPlugin').use(MiniAppConfigPlugin, [
    {
      type: 'runtime',
      appConfig,
      outputPath,
      target,
      getAppConfig,
      nativeConfig: options[target] && options[target].nativeConfig,
    }
  ]);
  config.plugin('MiniAppRuntimePlugin').use(MiniAppRuntimePlugin, [
    {
      ...appConfig,
      target,
      config: options[target],
      usingComponents,
      nativeLifeCycleMap,
      rootDir,
      command
    }
  ]);

  config.devServer.writeToDisk(true).noInfo(true).inline(false);
  config.devtool('inline-source-map');
  return config;
};
