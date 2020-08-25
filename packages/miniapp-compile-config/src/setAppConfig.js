const { dirname } = require('path');
const {
  platformMap,
  filterNativePages,
  getAppConfig,
} = require('miniapp-builder-shared');

const MiniAppConfigPlugin = require('rax-miniapp-config-webpack-plugin');

const AppLoader = require.resolve('jsx2mp-loader/src/app-loader');
const PageLoader = require.resolve('jsx2mp-loader/src/page-loader');

const setBaseConfig = require('./setBaseConfig');
const setEntry = require('./setEntry');

module.exports = (
  config,
  userConfig = {},
  { onGetWebpackConfig, context, target, entryPath, outputPath }
) => {
  const platformInfo = platformMap[target];
  const {
    mode = 'build',
    disableCopyNpm = false,
    turnOffSourceMap = false,
  } = userConfig;
  const { rootDir } = context;

  const appConfig = getAppConfig(rootDir, target);

  setEntry(config, appConfig.routes, { entryPath, rootDir, target });

  // Need Copy files or dir
  const needCopyList = [];

  const loaderParams = {
    mode,
    entryPath,
    outputPath,
    disableCopyNpm,
    turnOffSourceMap,
    platform: platformInfo,
  };

  appConfig.routes = filterNativePages(appConfig.routes, needCopyList, {
    rootDir,
    target,
    outputPath,
  });

  const pageLoaderParams = {
    ...loaderParams,
    entryPath,
  };

  const appLoaderParams = {
    ...loaderParams,
    entryPath: dirname(entryPath),
  };

  config.cache(true).mode('production').target('node');

  // Set base jsx2mp config
  setBaseConfig(config, userConfig, {
    onGetWebpackConfig,
    entryPath,
    context,
    loaderParams,
    target,
    outputPath,
  });

  needCopyList.forEach((dirPatterns) =>
    loaderParams.constantDir.push(dirPatterns.from)
  );

  // Add app and page jsx2mp loader
  config.module
    .rule('withRoleJSX')
    .use('app')
    .loader(AppLoader)
    .options(appLoaderParams)
    .end()
    .use('page')
    .loader(PageLoader)
    .options(pageLoaderParams)
    .end();

  config.plugin('miniAppConfig').use(MiniAppConfigPlugin, [
    {
      type: 'complie',
      appConfig,
      getAppConfig,
      outputPath,
      target,
      nativeConfig: userConfig.nativeConfig,
    },
  ]);

  return config;
};
