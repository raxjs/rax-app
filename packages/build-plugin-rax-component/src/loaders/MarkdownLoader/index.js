const path = require('path');
const parseMD = require('../../config/parseMarkdown');

module.exports = function(content) {
  const resourcePath = this.resourcePath;
  const ext = path.extname(resourcePath);
  const name = path.basename(resourcePath, ext);

  const result = parseMD(name, content, resourcePath);

  return result.js;
};
