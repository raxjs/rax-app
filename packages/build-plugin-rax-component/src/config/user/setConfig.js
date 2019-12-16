// const _ = require('lodash');
// const defaultConfig = require('./default.config');

// module.exports = (config, context, target) => {
//   const { userConfig } = context;

//   const supportConfig = _.pick(userConfig, Object.keys(_.omit(defaultConfig, ['devWatchLib', 'devOutputDir', 'outputDir'])));

//   _.forEach(supportConfig, (value, key) => {
//     const setKey = require(`./keys/${key}`);
//     setKey(config, context, value, target);
//   });
// };

const path = require('path');
const klawSync = require('klaw-sync');
// const defaultConfig = require('./default.config');

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