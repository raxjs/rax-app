const { existsSync, copySync } = require('fs-extra');
const { dirname, join, resolve } = require('path');
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

module.exports = (routes, needCopyList, { rootDir, target, outputPath, entryPath = './src/app' }) => {
  return routes.filter(({ source }) => {
    const pageEntry = getDepPath(rootDir, entryPath, source);
    if (isNativePage(pageEntry, target)) {
      needCopyList.push({
        from: dirname(pageEntry),
        to: join(target, dirname(source))
      });
      return false;
    }
    return true;
  });
};
