const { dirname, join } = require('path');
const { getDepPath, isNativePage } = require('./pathHelper');

/**
 * Filter native page
 * @param {Array} routes - user routes
 * @param {Array} needCopyList - need copy miniapp native pages
 * @param {object} options - function options
 * @param {string} options.rootDir - project root directory
 * @param {string} options.target - user platform
 * @returns {Array}
 */
module.exports = (routes, needCopyList, { rootDir, target }) => {
  return routes.filter(({ source }) => {
    const pageEntry = getDepPath(rootDir, source);
    if (isNativePage(pageEntry, target)) {
      needCopyList.push({
        from: dirname(join('src', source)),
        to: join(target, dirname(source))
      });
      return false;
    }
    return true;
  });
};
