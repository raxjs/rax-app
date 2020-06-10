const { existsSync, copySync } = require('fs-extra');
const { dirname, join } = require('path');
const { getDepPath } = require('./pathHelper');
const targetPlatformMap = require('./targetPlatformMap');

function isNativePages(filePath, target) {
  return existsSync(filePath + targetPlatformMap[target].tplExtension);
}

function copyNativePages(pageEntry, source, outputPath) {
  copySync(dirname(pageEntry), join(outputPath, dirname(source)));
}

module.exports = (routes, { rootDir, target, outputPath }) => {
  return routes.filter(({ source }) => {
    const pageEntry = getDepPath(rootDir, source);
    if (isNativePages(pageEntry, target)) {
      copyNativePages(pageEntry, source, outputPath);
      return false;
    }
    return true;
  });
}
