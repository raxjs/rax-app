const { getAppConfig, filterNativePages, getOutputPath } = require('miniapp-builder-shared');
const getMiniAppBabelPlugins = require('rax-miniapp-babel-plugins');
const MiniAppRuntimePlugin = require('rax-miniapp-runtime-webpack-plugin');
const MiniAppConfigPlugin = require('rax-miniapp-config-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

/**
 * Set miniapp runtime project webpack config
 * @param {object} config - webpack config chain
 * @param {object} userConfig - user config for miniapp
 * @param {object} options
 * @param {object} options.context - webpack context
 * @param {string} options.target - miniapp platform
 * @param {string} options.babelRuleName - babel loader name in webpack chain
 */
module.exports = (config, userConfig, { context, target, babelRuleName = 'babel', onGetWebpackConfig }) => {
  const { rootDir, command } = context;
  // Get miniapp output path
  const outputPath = getOutputPath(context, target);
  // Using components
  const usingComponents = {};
  // Native lifecycle map
  const nativeLifeCycleMap = {};

  // Using plugins
  const usingPlugins = {};

  // Need Copy files or dir
  const needCopyList = [];

  const appConfig = getAppConfig(rootDir, target, nativeLifeCycleMap);
  appConfig.routes = filterNativePages(appConfig.routes, needCopyList, { rootDir, target, outputPath });

  config.output.filename(`${target}/common/[name].js`);

  ['jsx', 'tsx'].forEach(ruleName => {
    config.module.rule(ruleName)
      .use(babelRuleName)
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
              runtimeDependencies: userConfig.runtimeDependencies,
            })
          }
        ];
        return options;
      });
  });

  config.plugin('MiniAppConfigPlugin').use(MiniAppConfigPlugin, [
    {
      type: 'runtime',
      appConfig,
      outputPath,
      target,
      getAppConfig,
      nativeConfig: userConfig.nativeConfig
    }
  ]);
  config.plugin('MiniAppRuntimePlugin').use(MiniAppRuntimePlugin, [
    {
      ...appConfig,
      target,
      config: userConfig,
      usingComponents,
      nativeLifeCycleMap,
      rootDir,
      command,
      usingPlugins,
      needCopyList
    }
  ]);

  if (needCopyList.length > 0) {
    config.plugin('copyWebpackPluginForRuntimeMiniapp')
      .use(CopyWebpackPlugin, [{
        patterns: needCopyList
      }]);
  }

  config.devServer.writeToDisk(true).noInfo(true).inline(false);
  config.devtool('none');

  // publicPath should not work in miniapp, just keep default value
  onGetWebpackConfig(target, (config) => {
    config.output.publicPath('/');
  });

  if (command === 'start') {
    config.devtool('inline-source-map');
  }
};
