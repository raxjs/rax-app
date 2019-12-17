const getWebpackBase = require('../getWebpackBase');
const setUserConfig = require('../user/setConfig');

module.exports = (context) => {
  const { userConfig } = context;
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

  setUserConfig({
    registerUserConfig: (registers) => {
      registers.forEach((register) => {
        if (register.configWebpack) {
          const value = userConfig[register.name] || register.defaultValue;
          register.configWebpack(config, value, {
            ...context,
            taskName: 'node',
          })
        }
      });
    },
  });

  return config;
};
