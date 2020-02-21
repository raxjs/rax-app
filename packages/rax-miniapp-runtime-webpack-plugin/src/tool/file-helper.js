const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

/**
 * Calculate file md5
 */
function md5File(filePath) {
  return crypto
    .createHash('md5')
    .update(fs.readFileSync(filePath))
    .digest('hex');
}

module.exports = {
  md5File,
};
