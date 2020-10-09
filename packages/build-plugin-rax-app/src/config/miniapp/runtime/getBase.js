const { setConfig } = require('miniapp-runtime-config');
const { pathHelper, platformMap } = require('miniapp-builder-shared');
const { join } = require('path');

const getWebpackBase = require('../../getWebpackBase');
const setEntry = require('../../setEntry');

const { getPlatformExtensions } = pathHelper;

module.exports = (context, target, options, onGetWebpackConfig) => {
  const { rootDir } = context;
  const config = getWebpackBase(context, {
    disableRegenerator: true
  }, target);

  setEntry(config, context, target);
  onGetWebpackConfig(target, config => {
    const { userConfig = {} } = context;
    const { outputDir = 'build' } = userConfig;
    config.output.path(join(rootDir, outputDir, target));
    config.devServer.contentBase(join(rootDir, outputDir));
    config.resolve.extensions
      .clear()
      .merge(getPlatformExtensions(platformMap[target].type, ['.js', '.jsx', '.ts', '.tsx', '.json']));

    setConfig(config, options[target] || {}, {
      context, target
    });
  });

  return config;
};

