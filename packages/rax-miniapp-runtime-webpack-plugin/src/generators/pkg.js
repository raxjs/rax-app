const { resolve } = require('path');
const { readJSONSync } = require('fs-extra');
const addFileToCompilation = require('../utils/addFileToCompilation');

module.exports = function(compilation, { target, command, rootDir }) {
  const pkgPath = resolve(process.cwd(), 'package.json');
  const pkgContent = readJSONSync(pkgPath, {
    encoding: 'utf-8'
  });
  addFileToCompilation(compilation, {
    filename: 'package.json',
    content: JSON.stringify({
      dependencies: pkgContent.dependencies
    }),
    command,
    target,
  });
};
