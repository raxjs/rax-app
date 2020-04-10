const path = require('path');
const klawSync = require('klaw-sync');

module.exports = (api) => {
  const { registerUserConfig } = api;
  const files = klawSync(path.resolve(__dirname, './keys'));

  const configArr = files.map(fileInfo => {
    const keyName = path.basename(fileInfo.path).replace('.js', '');
    const keyConfig = require(fileInfo.path);
    keyConfig.name = keyName;
    return keyConfig;
  });

  registerUserConfig(configArr);
};
