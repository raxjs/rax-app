const { existsSync } = require('fs-extra');
const { getDepPath } = require('./pathHelper');
const targetPlatformMap = require('./targetPlatformMap');

function isNativePages(filePath, target) {
  return existsSync(filePath + targetPlatformMap[target].tplExtension);
}

module.exports = (rootDir, target, routes) => {
  return routes.filter(({ source }) => {
    const pageEntry = getDepPath(rootDir, source);
    return !isNativePages(pageEntry, target);
  });
}
