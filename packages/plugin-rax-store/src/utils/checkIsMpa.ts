export default (userConfig) => {
  const krakenConfig = userConfig.kraken || {};
  const weexConfig = userConfig.weex || {};
  const webConfig = userConfig.web || {};

  return krakenConfig.mpa || weexConfig.mpa || webConfig.mpa;
};
