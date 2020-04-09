const {
  existsSync
} = require('fs-extra');
const { removeExt } = require('./pathHelper');

const suffix = {
  ali: ['.js', '.json', '.axml'],
  wechat: ['.js', '.json', '.wxml'],
  quickapp: ['.ux'],
};
// e.g file:   /root/lib/miniapp/index
module.exports = function(filename, platform = 'ali') {
  return suffix[platform].every(s => existsSync(removeExt(filename) + s));
};
