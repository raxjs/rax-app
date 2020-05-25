const { sep } = require('path');
const getFilePath = require('./getFilePath');

/**
 * @param {string} filename - Current handled file name
 * @param {object} nativeLifeCycleMap - Native lifecycle map
 * @return {string|undefined}
 */
module.exports = function(filename, nativeLifeCycleMap) {
  const nodeModulesReg = new RegExp(`${sep}node_modules${sep}`);
  if (!nodeModulesReg.exec(filename)) {
    const filePath = getFilePath(filename);
    if (nativeLifeCycleMap[filePath]) {
      // Reset page lifecycle map
      nativeLifeCycleMap[filePath] = {};
    }
    return filePath;
  }
};
