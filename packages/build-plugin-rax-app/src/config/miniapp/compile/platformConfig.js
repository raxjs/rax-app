const { MINIAPP, WECHAT_MINIPROGRAM, QUICKAPP } = require('../../../constants');


module.exports = {
  [MINIAPP]: {
    type: 'ali',
    name: 'Alibaba MiniApp',
    extension: {
      xml: '.axml',
      css: '.acss',
    }
  },
  [WECHAT_MINIPROGRAM]: {
    type: 'wechat',
    name: 'WeChat MiniProgram',
    extension: {
      xml: '.wxml',
      css: '.wxss',
    }
  },
  [QUICKAPP]: {
    type: 'quickapp',
    name: 'QuickApp',
    extension: {
      xml: '.ux',
      css: '.css',
    }
  },
  // Wait for implementation
  // 'baidu': {
  //   type: 'baidu',
  //   name: 'Baidu SmartProgram',
  //   extension: {
  //     xml: '.swan',
  //     css: '.css',
  //   }
  // },
  // 'bytedance': {
  //   type: 'bytedance',
  //   name: 'ByteDance MicroApp',
  //   extension: {
  //     xml: '.ttml',
  //     css: '.ttss'
  //   }
  // }
};
