const path = require('path');

module.exports = (pathStr) => {
  return process.platform === 'win32' ? pathStr.split(path.sep).join('/') : pathStr;
};
