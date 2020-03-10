const path = require('path');
const { readFileSync } = require('fs-extra');
const crypto = require('crypto');

/**
 * Calculate file md5
 */
function md5File(filePath) {
  return crypto
    .createHash('md5')
    .update(readFileSync(filePath))
    .digest('hex');
}

function isUrl(src) {
  return /^(https?:)?\/\//.test(src);
}

module.exports = {
  md5File,
  isUrl
};
