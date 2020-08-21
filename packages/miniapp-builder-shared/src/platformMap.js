const { MINIAPP, WECHAT_MINIPROGRAM, BYTEDANCE_MICROAPP, QUICKAPP } = require('./utils/constants');

module.exports = {
  [MINIAPP]: {
    name: 'ali',
    tplExtension: '.axml'
  },
  [WECHAT_MINIPROGRAM]: {
    name: 'wechat',
    tplExtension: '.wxml'
  },
  [BYTEDANCE_MICROAPP]: {
    name: 'bytedance',
    tplExtension: '.ttml'
  },
  [QUICKAPP]: {
    name: 'quickapp',
    tplExtension: '.ux'
  }
};
