const MiniAppRuntimePlugin = require('rax-miniapp-runtime-webpack-plugin');
const MiniAppConfigPlugin = require('rax-miniapp-config-webpack-plugin');
const getMiniAppBabelPlugins = require('rax-miniapp-babel-plugins');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const getWebpackBase = require('../../getWebpackBase');
const getAppConfig = require('../getAppConfig');
const setEntry = require('../../setEntry');
const getMiniAppOutput = require('../getOutputPath');
const filterNativePages = require('../filterNativePages');

module.exports = (context, target, options) => {
  const { rootDir, command } = context;
  const outputPath = getMiniAppOutput(context, { target });

  // Using Components
  const usingComponents = {};
  // Native lifecycle map
  const nativeLifeCycleMap = {};
  // Need Copy files or dir
  const needCopyList = [];

  const config = getWebpackBase(context, {
    disableRegenerator: true
  }, target);
  const appConfig = getAppConfig(rootDir, target, nativeLifeCycleMap);
  appConfig.routes = filterNativePages(appConfig.routes, needCopyList, { rootDir, target, outputPath });
  setEntry(config, context, target);

  config.output
    .filename(`${target}/common/[name].js`);

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
      needCopyList
    }
  ]);

  config.plugin('copyWebpackPlugin')
    .use(CopyWebpackPlugin, [needCopyList]);

  config.devServer.writeToDisk(true).noInfo(true).inline(false);
  if (command === 'start') {
    config.devtool('inline-source-map');
  }
  return config;
};

