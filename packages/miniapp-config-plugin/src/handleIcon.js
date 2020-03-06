const { resolve, extname, join } = require('path');
const { copy } = require('fs-extra');
const { isUrl, md5File } = require('./fileHelper');

module.exports = function(path, outputPath) {
  if (!isUrl(path)) {
    const iconPathName = md5File(resolve('src', path)) + extname(path);
    const iconPath = join('.', 'assets', iconPathName);
    copy(resolve('src', path), resolve(outputPath, iconPath));
    return iconPath;
  }
  return path;
};
