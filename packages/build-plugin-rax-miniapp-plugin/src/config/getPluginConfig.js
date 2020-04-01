const { resolve } = require('path');
const { readJSONSync } = require('fs-extra');

module.exports = (rootDir) => {
  const pluginConfig = readJSONSync(resolve(rootDir, 'src', 'plugin.json'));
  return pluginConfig;
};
