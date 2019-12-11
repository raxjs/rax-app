const getWebpackBase = require('../getWebpackBase');
const setEntry = require('../setEntry');
const { KRAKEN } = require('../../constants');


module.exports = (context) => {
  const config = getWebpackBase(context);
  setEntry(config, context, KRAKEN);

  config.output.filename(`${KRAKEN}/[name].js`);

  return config;
};
