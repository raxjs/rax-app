const Config = require('webpack-chain');
const setWebpackLoaders = require('./setWebpackLoaders');
const setWebpackPlugins = require('./setWebpackPlugins');

module.exports = (options) => {
  const config = new Config();

  config.mode(options.mode);
  config.resolve.extensions
    .merge(['.js', '.json', '.jsx', '.ts', '.tsx', '.html']);
  // webpack loaders
  setWebpackLoaders(config, options);
  // webpack plugins
  setWebpackPlugins(config, options);

  return config;
};
