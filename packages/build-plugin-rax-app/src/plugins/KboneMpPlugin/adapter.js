const { MINIAPP, WECHAT_MINIPROGRAM } = require("../../constants");

module.exports = {
  [MINIAPP]: {
    name: 'Alibaba MiniApp',
    ext: "acss"
  },
  [WECHAT_MINIPROGRAM]: {
    name: 'Wechat MiniProgram',
    ext: "wxss"
  }
};
