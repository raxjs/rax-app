const { platformMap } = require('miniapp-builder-shared');
const setBaseConfig = require('./setBaseConfig');

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

  const loaderParams = {
    mode,
    entryPath,
    outputPath,
    disableCopyNpm,
    turnOffSourceMap,
    platform: platformInfo,
  };

  config.entryPoints.clear();
  config.entry("component").add(`./${entryPath}?role=component`);

  setBaseConfig(config, userConfig, {
    context,
    onGetWebpackConfig,
    entryPath,
    outputPath,
    loaderParams,
    target
  })

  return config;
};
