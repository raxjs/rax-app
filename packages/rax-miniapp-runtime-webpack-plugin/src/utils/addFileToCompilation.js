const { extname } = require('path');
const { minify } = require('./minifyCode');

// Add file to compilation
module.exports = function(compilation, { filename, content, command = 'build', target }) {
  compilation.assets[`${filename}`] = {
    source: () => command === 'build' ? minify(content, extname(filename)) : content,
    size: () => Buffer.from(content).length
  };
};
