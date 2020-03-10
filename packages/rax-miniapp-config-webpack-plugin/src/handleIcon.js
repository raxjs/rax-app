const { resolve, dirname, relative } = require('path');
const { copy, existsSync, ensureDirSync } = require('fs-extra');

function isUrl(src) {
  return /^(https?:)?\/\//.test(src);
}

module.exports = function(path, outputPath) {
  if (!isUrl(path)) {
    const sourcePath = resolve('src', path);
    if (existsSync(sourcePath)) {
      ensureDirSync(resolve(outputPath, dirname(path)));
      copy(sourcePath, path);
    }
  }
  return path;
};
