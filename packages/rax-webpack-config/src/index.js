const getBaseConfig = require('./webpack.base');
const configBuild = require('./webpack.build');
const configDev = require('./webpack.dev');

module.exports = (options) => {
  const config = getBaseConfig(options);
  if (options.mode === 'development') {
    configDev(config);
  } else {
    configBuild(config);
  }
  return config;
};
