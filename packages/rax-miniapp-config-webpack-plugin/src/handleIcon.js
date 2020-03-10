const { resolve, extname, join } = require('path');
const { copy, existsSync } = require('fs-extra');
const { isUrl, md5File } = require('./fileHelper');

module.exports = function(path, outputPath) {
  if (!isUrl(path)) {
    const sourcePath = resolve('src', path);
    if (existsSync(sourcePath)) {
      const iconPathName = md5File(sourcePath) + extname(path);
      const iconPath = join('.', 'assets', iconPathName);
      copy(resolve('src', path), resolve(outputPath, iconPath));
      return iconPath;
    }
  }
  return path;
};
