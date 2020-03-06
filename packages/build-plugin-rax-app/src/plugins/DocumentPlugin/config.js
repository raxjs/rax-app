const path = require('path');
const klawSync = require('klaw-sync');
const getWebpackBase = require('../../config/getWebpackBase');

module.exports = (context, options) => {
  const { userConfig } = context;
  const { alias = {}, configWebpack } = options;

  const config = getWebpackBase(context, {
    isSSR: true
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

  // Sync the alias from webpack config for Web. eg. react, react-dom
  Object.keys(alias).forEach((key) => {
    config.resolve.alias.set(key, alias[key]);
  });

  // Sync the user config in build.json to document config.
  const files = klawSync(path.resolve(__dirname, '../../config/user/keys'));
  files.map(fileInfo => {
    const userConfigKey = path.basename(fileInfo.path).replace('.js', '');
    const userConfigRegister = require(fileInfo.path);
    const value = userConfig[userConfigKey] || userConfigRegister.defaultValue;
    userConfigRegister.configWebpack(config, value, {
      ...context,
      taskName: 'node',
    });
  });

  // Sync the custom config for document.
  if (configWebpack) {
    configWebpack(config);
  }

  return config;
};
