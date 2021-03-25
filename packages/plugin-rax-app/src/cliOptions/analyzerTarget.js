const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = (config, analyzer, { taskName }) => {
  if (analyzer === taskName) {
    config.plugin('webpack-bundle-analyzer')
      .use(BundleAnalyzerPlugin, [{ analyzerPort: '9000' }]);
  }
};
