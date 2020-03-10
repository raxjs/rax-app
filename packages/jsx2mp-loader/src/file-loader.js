const { join, relative, dirname } = require('path');
const { copySync } = require('fs-extra');

const loaderUtils = require('loader-utils');

module.exports = function fileLoader(content) {
  const { entryPath, outputPath } = loaderUtils.getOptions(this) || {};
  const rootContext = this.rootContext;

  const relativeFilePath = relative(
    join(rootContext, dirname(entryPath)),
    this.resourcePath
  );
  const distSourcePath = join(outputPath, relativeFilePath);
  copySync(this.resourcePath, distSourcePath);

  return '';
};

