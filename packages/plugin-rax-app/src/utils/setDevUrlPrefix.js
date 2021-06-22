const address = require('address');
const { DEV_URL_PREFIX } = require('../constants');

module.exports = (api) => {
  const { setValue, context } = api;
  const { commandArgs, userConfig: { devServer: { host, port } } } = context;
  const protocol = commandArgs.https ? 'https' : 'http';
  let urlPrefix = `${protocol}://${ commandArgs.host || host || address.ip() }:${ commandArgs.port }`;
  if (process.env.CLOUDIDE_ENV) {
    urlPrefix = `https://${process.env.WORKSPACE_UUID}-${commandArgs.port || port}.${process.env.WORKSPACE_HOST}`;
  }

  setValue(DEV_URL_PREFIX, urlPrefix);
};
