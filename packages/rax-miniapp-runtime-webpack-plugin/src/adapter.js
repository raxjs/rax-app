const { MINIAPP, WECHAT_MINIPROGRAM } = require('./constants');

module.exports = {
  [MINIAPP]: {
    name: 'Alibaba MiniApp',
    APINamespace: 'my',
    npmDirName: 'node_modules',
    fileName: 'ali',
    css: 'acss',
    xml: 'axml',
    directive: {
      prefix: 'a',
      if: 'a:if',
      elif: 'a:alif',
      event: 'on'
    },
  },
  [WECHAT_MINIPROGRAM]: {
    name: 'Wechat MiniProgram',
    APINamespace: 'wx',
    npmDirName: 'miniprogram_npm',
    fileName: 'wechat',
    css: 'wxss',
    xml: 'wxml',
    directive: {
      prefix: 'wx',
      if: 'wx:if',
      elif: 'wx:alif',
      event: 'bind'
    },
  },
};
