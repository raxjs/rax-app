const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = (config, context) => {
  const { userConfig} = context;
  const { analyzer } = userConfig;

  if(analyzer){
    // reference: https://www.npmjs.com/package/webpack-bundle-analyzer
    config.plugin('BundleAnalyzerPlugin')
      .use(BundleAnalyzerPlugin)
  }
};
