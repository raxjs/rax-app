const MiniAppRuntimePlugin = require('rax-miniapp-runtime-webpack-plugin');
const MiniAppConfigPlugin = require('rax-miniapp-config-webpack-plugin');
const getMiniAppBabelPlugins = require('rax-miniapp-babel-plugins');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { resolve, join } = require('path');

const getWebpackBase = require('../../getWebpackBase');
const getAppConfig = require('../getAppConfig');
const setEntry = require('../../setEntry');
const getMiniAppOutput = require('../getOutputPath');
const filterNativePages = require('../filterNativePages');
const targetPlatformMap = require('../targetPlatformMap');
const { getPlatformExtensions } = require('../../pathHelper');

module.exports = (context, target, options, onGetWebpackConfig) => {
  const { rootDir, command } = context;
  const { distDir = '', entryPath = 'src/app', dualEngine = true } = options[target] || {};
  const outputPath = getMiniAppOutput(context, { target, distDir });

  // Using components
  const usingComponents = {};
  // Native lifecycle map
  const nativeLifeCycleMap = {};

  // Using plugins
  const usingPlugins = {};

  // Need Copy files or dir
  const needCopyList = [];

  const config = getWebpackBase(context, {
    disableRegenerator: true
  }, target);
  const appConfig = getAppConfig(rootDir, entryPath, target, nativeLifeCycleMap);
  appConfig.routes = filterNativePages(appConfig.routes, needCopyList, { rootDir, entryPath, target, outputPath });
  setEntry(config, context, entryPath, target);
  config.resolve.extensions
    .clear()
    .merge(getPlatformExtensions(targetPlatformMap[target].name, ['.js', '.jsx', '.ts', '.tsx', '.json']));

  config.output
    .filename('common/[name].js');

  config.module.rule('jsx')
    .use('babel')
    .tap(options => {
      options.presets = [
        ...options.presets,
        {
          plugins: getMiniAppBabelPlugins({
            usingComponents,
            nativeLifeCycleMap,
            target,
            rootDir,
            usingPlugins,
            dualEngine
          })
        }
      ];
      return options;
    });

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
      command,
      usingPlugins,
      needCopyList
    }
  ]);

  config.plugin('copyWebpackPluginForRuntimeMiniapp')
    .use(CopyWebpackPlugin, [needCopyList]);

  config.devServer.writeToDisk(true).noInfo(true).inline(false);

  if (command === 'start') {
    config.devtool('inline-source-map');
  }

  onGetWebpackConfig(target, (config) => {
    const outputPath = resolve(rootDir, distDir ? distDir : join('build', target));
    config.output.path(outputPath);
  });


  return config;
};

