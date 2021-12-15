import { IOptions } from './types';
import getBaseConfig from './webpack.base';
import configBuild from './webpack.build';
import configDev from './webpack.dev';

export default (options: IOptions) => {
  const config = getBaseConfig(options);
  if (options.mode === 'development') {
    configDev(config);
  } else {
    configBuild(config);
  }
  return config;
};

export { createCSSRule } from './setWebpackLoaders';
