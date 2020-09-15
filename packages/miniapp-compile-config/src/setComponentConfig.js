const { platformMap } = require('miniapp-builder-shared');
const { existsSync } = require('fs-extra');
const { resolve } = require('path');
const setBaseConfig = require('./setBaseConfig');

module.exports = (
  config,
  userConfig = {},
  { onGetWebpackConfig, context, target, entryPath, outputPath }
) => {
  const platformInfo = platformMap[target];
  const {
    mode = 'build',
    disableCopyNpm = mode === 'build',
    turnOffSourceMap = false,
    constantDir = []
  } = userConfig;
  const { rootDir } = context;

  const loaderParams = {
    mode,
    entryPath,
    outputPath,
    disableCopyNpm,
    turnOffSourceMap,
    platform: platformInfo,
  };

  config.entryPoints.clear();
  config.entry('component').add(`./${entryPath}?role=component`);

  // Set constantDir
  // `public` directory is the default static resource directory
  const isPublicFileExist = existsSync(resolve(rootDir, 'src/public'));

  // To make old `constantDir` param compatible
  loaderParams.constantDir = isPublicFileExist
    ? ['src/public'].concat(constantDir)
    : constantDir;

  setBaseConfig(config, userConfig, {
    context,
    onGetWebpackConfig,
    entryPath,
    outputPath,
    loaderParams,
    target,
  });
};
