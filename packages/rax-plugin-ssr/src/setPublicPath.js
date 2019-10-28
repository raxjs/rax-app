const address = require('address');

// 当页面和 assets 使用的不是同一个 server, 需将 publicPath 替换为绝对地址
// 否则无论是模板中的资源还是异步加载的 bundle 都是以当前页面地址去加载的
module.exports = (config) => {
  const publicPath = config.output.get('publicPath');

  if (!publicPath || publicPath === '.' || publicPath === '/' || publicPath === './') {
    const absloutePublicPath = `http://${address.ip()}:${config.devServer.get('port')}/`;
    config.output.set('publicPath', absloutePublicPath);
  }
};