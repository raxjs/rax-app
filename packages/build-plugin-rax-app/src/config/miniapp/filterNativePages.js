const { existsSync, copySync } = require('fs-extra');
const { dirname, join } = require('path');
const { getDepPath, isNativePage } = require('../pathHelper');

module.exports = (routes, needCopyList, { rootDir, target, outputPath }) => {
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
