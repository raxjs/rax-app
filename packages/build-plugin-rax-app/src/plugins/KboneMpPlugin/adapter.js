const { MINIAPP, WECHAT_MINIPROGRAM } = require("../../constants");

module.exports = {
  [MINIAPP]: {
    name: 'Alibaba MiniApp',
    css: "acss",
    xml: "axml"
  },
  [WECHAT_MINIPROGRAM]: {
    name: 'Wechat MiniProgram',
    css: "wxss",
    xml: "wxml"
  }
};
