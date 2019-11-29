const getWebpackBase = require('../getWebpackBase');
const setEntry = require('../setEntry');
const setUserConfig = require('../user/setConfig');
const { KRAKEN } = require('../../constants');


module.exports = (context) => {
  const config = getWebpackBase(context);
  setEntry(config, context, KRAKEN);

  config.output.filename(`${KRAKEN}/[name].js`);

  setUserConfig(config, context, KRAKEN);

  return config;
};
