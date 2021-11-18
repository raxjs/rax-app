import { DEV_URL_PREFIX } from '../constants';

export default (api) => {
  const { setValue, context } = api;
  const { commandArgs, userConfig: { devServer: { host, port } } } = context;
  const protocol = commandArgs.https ? 'https' : 'http';
  let urlPrefix = `${protocol}://${commandArgs.host || host}:${commandArgs.port}`;
  if (process.env.CLOUDIDE_ENV) {
    urlPrefix = `https://${process.env.WORKSPACE_UUID}-${commandArgs.port || port}.${process.env.WORKSPACE_HOST}`;
  }

  setValue(DEV_URL_PREFIX, urlPrefix);
};
