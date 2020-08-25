const { setConfig } = require('miniapp-runtime-config');
const { pathHelper, platformMap } = require('miniapp-builder-shared');

const getWebpackBase = require('../../getWebpackBase');
const setEntry = require('../../setEntry');

const { getPlatformExtensions } = pathHelper;

module.exports = (context, target, options) => {
  const config = getWebpackBase(context, {
    disableRegenerator: true
  }, target);

  setEntry(config, context, target);

  config.resolve.extensions
    .clear()
    .merge(getPlatformExtensions(platformMap[target].type, ['.js', '.jsx', '.ts', '.tsx', '.json']));

  setConfig(config, options[target] || {}, {
    context, target
  });

  return config;
};

