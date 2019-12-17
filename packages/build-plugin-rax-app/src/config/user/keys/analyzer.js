const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  defaultValue: false,
  validation: 'boolean',
  configWebpack: (config, value) => {
    if (value) {
      // reference: https://www.npmjs.com/package/webpack-bundle-analyzer
      config.plugin('BundleAnalyzerPlugin')
        .use(BundleAnalyzerPlugin);
    }
  },
};
