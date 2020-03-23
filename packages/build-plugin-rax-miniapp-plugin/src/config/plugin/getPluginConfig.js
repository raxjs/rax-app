const { join, resolve } = require('path');
const { readJSONSync } = require('fs-extra');
const { getRouteName } = require('rax-compile-config');

const {
  moduleResolve,
  normalizeOutputFilePath,
  getRelativePath
} = require('./pathHelper');

module.exports = (rootDir) => {

  const pluginConfig = readJSONSync(resolve(rootDir, 'src', 'plugin.json'));
  return pluginConfig;
};
