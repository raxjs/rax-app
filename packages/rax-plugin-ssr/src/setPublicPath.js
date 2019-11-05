const address = require('address');

// ssr server may different from assets server, replace publicPath with an absolute address
module.exports = (config) => {
  const publicPath = config.output.get('publicPath');

  if (!publicPath || publicPath === '.' || publicPath === '/' || publicPath === './') {
    const absloutePublicPath = `http://${address.ip()}:${config.devServer.get('port')}/`;
    config.output.set('publicPath', absloutePublicPath);
  }
};