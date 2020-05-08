const getFilePath = require('./getFilePath');

/**
 * @param {string} filename - Current handled file name
 * @param {object} nativeLifeCycleMap - Native lifecycle map
 * @return {string|undefined}
 */
module.exports = function(filename, nativeLifeCycleMap) {
  if (!/\/node_modules\//.test(filename)) {
    const filePath = getFilePath(filename);
    if (nativeLifeCycleMap[filePath]) {
      // Reset page lifecycle map
      nativeLifeCycleMap[filePath] = {};
    }
    return filePath;
  }
};
