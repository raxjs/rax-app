const { join } = require('path');
const getFilePath = require('./getFilePath');

/**
 * @param {string} rootDir - Project root dir
 * @param {string} filename - Current handled file name
 * @param {Array} routes - Project routes
 * @param {object} nativeLifeCycleMap - Native lifecycle map
 * @return {string|undefined}
 */
module.exports = function(rootDir, filename, routes, nativeLifeCycleMap) {
  if (!/\/node_modules\//.test(filename)) {
    const filePath = getFilePath(filename);
    routes.forEach(({ source }) => {
      if (join(rootDir, 'src', source) === filePath) {
        nativeLifeCycleMap[filePath] = {};
      }
    });
    return filePath;
  }
};
