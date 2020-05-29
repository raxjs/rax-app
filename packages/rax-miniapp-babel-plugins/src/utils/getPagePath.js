const { sep } = require('path');
const getFilePath = require('./getFilePath');

/**
 * @param {string} filename - Current handled file name
 * @return {string|undefined}
 */
module.exports = function(filename) {
  const nodeModulesReg = new RegExp(`${sep}node_modules${sep}`);
  if (!nodeModulesReg.exec(filename)) {
    return getFilePath(filename);
  }
};
