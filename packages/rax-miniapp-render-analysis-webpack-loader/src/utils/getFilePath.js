const { extname } = require('path');

module.exports = function(resourcePath) {
  return resourcePath.replace(extname(resourcePath), '');
};
