const getWebpackBase = require('../getWebpackBase');
const setUserConfig = require('../user/setConfig');

module.exports = (context) => {
  const config = getWebpackBase(context, {
    isSSR: true,
  });

  config.target('node');

  config.output
    .libraryTarget('commonjs2');

  ['jsx', 'tsx'].forEach(tag => {
    config.module.rule(tag)
      .use('platform')
      .options({
        platform: 'node',
      });
  });

  setUserConfig(config, context, 'node');
  return config;
};
