const { MINIAPP, WECHAT_MINIPROGRAM } = require("../../constants");

module.exports = {
  [MINIAPP]: {
    name: 'Alibaba MiniApp',
    APINamespace: 'my',
    css: 'acss',
    xml: 'axml',
    directive: {
      prefix: 'a',
      if: 'a:if',
      elif: 'a:alif'
    }
  },
  [WECHAT_MINIPROGRAM]: {
    name: 'Wechat MiniProgram',
    APINamespace: 'wx',
    css: 'wxss',
    xml: 'wxml',
    directive: {
      prefix: 'wx',
      if: 'wx:if',
      elif: 'wx:alif'
    }
  }
};
