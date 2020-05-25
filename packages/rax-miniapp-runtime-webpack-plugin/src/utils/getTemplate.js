const { resolve } = require('path');
const { readFileSync } = require('fs-extra');
const { MINIAPP, WECHAT_MINIPROGRAM } = require('../constants');

module.exports = function getTemplate(rootDir, target, type) {
  let platformDir;
  switch (target) {
    case MINIAPP:
      platformDir = 'ali-miniapp';
      break;
    case WECHAT_MINIPROGRAM:
      platformDir = 'wechat-miniprogram';
      break;
  }
  return readFileSync(resolve(rootDir, 'templates', platformDir, `${type}.js.ejs`), 'utf-8');
};
