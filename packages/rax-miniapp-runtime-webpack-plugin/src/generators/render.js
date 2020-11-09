const path = require('path');
const { readFileSync } = require('fs-extra');
const adapter = require('../adapter');
const addFileToCompilation = require('../utils/addFileToCompilation');

module.exports = function(compilation, { target, command, rootDir }) {
  const sourceNpmFile = path.join(
    require.resolve('miniapp-render').replace('/dist/ali/index.js', ''),
    'dist',
    adapter[target].fileName,
    command === 'build' ? 'index.min.js' : 'index.js'
  );
  addFileToCompilation(compilation, {
    filename: 'render.js',
    content: readFileSync(sourceNpmFile, 'utf-8'),
    command,
    target,
  });
};
