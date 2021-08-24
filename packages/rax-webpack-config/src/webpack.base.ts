import * as Config from 'webpack-chain';
import setWebpackLoaders from './setWebpackLoaders';
import setWebpackPlugins from './setWebpackPlugins';

export default (options) => {
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
