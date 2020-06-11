const { existsSync } = require('fs-extra');
const { getDepPath } = require('./pathHelper');
const targetPlatformMap = require('./targetPlatformMap');

/**
 * Judge whether the file is a native page according to the existence of the template file
 * @param {string} filePath
 * @param {string} target
 */
function isNativePage(filePath, target) {
  return existsSync(filePath + targetPlatformMap[target].tplExtension);
}

module.exports = (routes, { rootDir, target }) => {
  return routes.filter(({ source }) => {
    const pageEntry = getDepPath(rootDir, source);
    return !isNativePage(pageEntry, target);
  });
};
