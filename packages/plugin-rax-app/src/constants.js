const { constants: { MINIAPP, WECHAT_MINIPROGRAM, BYTEDANCE_MICROAPP, BAIDU_SMARTPROGRAM, KUAISHOU_MINIPROGRAM, QUICKAPP } } = require('miniapp-builder-shared');

module.exports = {
  WEB: 'web',
  DOCUMENT: 'document',
  SSR: 'ssr',
  WEEX: 'weex',
  KRAKEN: 'kraken',
  MINIAPP,
  WECHAT_MINIPROGRAM,
  BYTEDANCE_MICROAPP,
  BAIDU_SMARTPROGRAM,
  KUAISHOU_MINIPROGRAM,
  QUICKAPP,
  GET_RAX_APP_WEBPACK_CONFIG: 'getRaxAppWebpackConfig',
  DEV_URL_PREFIX: 'devUrlPrefix',
  STATIC_CONFIG: 'staticConfig',
  CUSTOM_TAB_BAR: 'CUSTOM_TAB_BAR',
};
