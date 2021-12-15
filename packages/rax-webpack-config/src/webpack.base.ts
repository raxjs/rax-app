import * as Config from '@builder/pack/deps/webpack-chain';
import setWebpackLoaders from './setWebpackLoaders';
import setWebpackPlugins from './setWebpackPlugins';
import { IOptions } from './types';

export default (options: IOptions) => {
  const config = new Config();

  config.mode(options.mode);
  config.resolve.extensions
    .merge(['.js', '.json', '.jsx', '.ts', '.tsx', '.html']);
  // webpack loaders
  setWebpackLoaders(config, options);
  // webpack plugins
  setWebpackPlugins(config);

  return config;
};
