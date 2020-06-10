const { existsSync, copySync } = require('fs-extra');
const { dirname, join } = require('path');
const chokidar = require('chokidar');
const { getDepPath } = require('./pathHelper');
const targetPlatformMap = require('./targetPlatformMap');

function isNativePages(filePath, target) {
  return existsSync(filePath + targetPlatformMap[target].tplExtension);
}

module.exports = (routes, { rootDir, target }) => {
  return routes.filter(({ source }) => {
    const pageEntry = getDepPath(rootDir, source);
    return !isNativePages(pageEntry, target);
  });
};
