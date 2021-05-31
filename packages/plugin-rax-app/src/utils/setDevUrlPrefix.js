const address = require('address');
const { DEV_URL_PREFIX } = require('../constants');

module.exports = (api) => {
  const { setValue, context } = api;
  const { commandArgs, userConfig: { devServer: { host } } } = context;
  const protocol = commandArgs.https ? 'https' : 'http';
  let urlPrefix = `${protocol}://${ host || address.ip() }:${ commandArgs.port }`;
  if (process.env.CLOUDIDE_ENV) {
    urlPrefix = `https://${process.env.WORKSPACE_UUID}-${commandArgs.port}.${process.env.WORKSPACE_HOST}`;
  }

  setValue(DEV_URL_PREFIX, urlPrefix);
};
