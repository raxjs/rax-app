const address = require('address');

module.exports = {
  inlineStyle: true,
  analyzer: false,
  outputDir: 'build',
  publicPath: '/',
  devPublicPath: '/',
  hash: false,
  devServer: {
    compress: true,
    disableHostCheck: true,
    clientLogLevel: 'error',
    hot: true,
    quiet: true,
    overlay: false,
    host: address.ip(),
    port: 9999,
  },
};
