const path = require('path');
const klawSync = require('klaw-sync');

module.exports = (config, context) => {
  const { userConfig } = context;
  const files = klawSync(path.resolve(path.dirname(require.resolve('build-plugin-rax-app')), 'config', 'user', 'keys'));

  files.forEach(fileInfo => {
    const keyName = path.basename(fileInfo.path).replace('.js', '');
    const keyConfig = require(fileInfo.path);

    const { configWebpack, defaultValue } = keyConfig;
    const value = userConfig[keyName] || defaultValue;
    context.taskName = 'web';
    configWebpack(config, value, context);
  });
};
