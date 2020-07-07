const md5 = require('md5');

module.exports = function getTagName(str) {
  return 'c' + md5(str).slice(0, 6);
};
