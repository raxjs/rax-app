const path = require('path');
const parseMd = require('../../config/utils/parseMarkdown');

module.exports = function() {
  const resourcePath = this.resourcePath;
  const ext = path.extname(resourcePath);
  const name = path.basename(resourcePath, ext);

  const result = parseMd(name, resourcePath);

  return result.js;
};
