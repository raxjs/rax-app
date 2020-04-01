const WeexFrameworkBanner = require('../../plugins/WeexFrameworkBannerPlugin');
const getWebpackBase = require('../getWebpackBase');
const setEntry = require('../setEntry');
const { WEEX } = require('../../constants');

module.exports = (context) => {
  const config = getWebpackBase(context, {}, WEEX);
  setEntry(config, context, WEEX);

  config.output.filename(`${WEEX}/[name].js`);

  config.plugin('weexFrame')
    .use(WeexFrameworkBanner);

  return config;
};
