const { existsSync, copySync } = require('fs-extra');
const { dirname, join } = require('path');
const { getDepPath } = require('../pathHelper');
const targetPlatformMap = require('./targetPlatformMap');

/**
 * Judge whether the file is a native page according to the existence of the template file
 * @param {string} filePath
 * @param {string} target
 */
function isNativePage(filePath, target) {
  return existsSync(filePath + targetPlatformMap[target].tplExtension);
}

function copyNativePage(pageEntry, source, outputPath) {
  copySync(dirname(pageEntry), join(outputPath, dirname(source)));
}

module.exports = (routes, { rootDir, target, outputPath, entryPath = './src/app' }) => {
  return routes.filter(({ source }) => {
    const pageEntry = getDepPath(rootDir, entryPath, source);
    if (isNativePage(pageEntry, target)) {
      copyNativePage(pageEntry, source, outputPath);
      return false;
    }
    return true;
  });
};
