module.exports = {
  outputDir: 'lib',
  devOutputDir: 'lib',
  devWatchLib: false,
  distDir: 'build',
  publicPath: '/',
  devPublicPath: '/',
  devServer: {
    compress: true,
    disableHostCheck: true,
    clientLogLevel: 'error',
    hot: true,
    quiet: true,
    overlay: false,
    port: 9999,
  },
};
