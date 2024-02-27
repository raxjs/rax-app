const { BundleAnalyzerPlugin } = require('@builder/pack/deps/webpack-bundle-analyzer');

module.exports = (config, analyzer, { taskName }) => {
  if (analyzer === taskName) {
    config.plugin('webpack-bundle-analyzer')
      .use(BundleAnalyzerPlugin, [{ analyzerPort: '9000' }]);
    
    // MiniCssExtractPlugin.loader will cause css being hidden from bundle analyzer report, remove it here
    [
      'css',
      'less',
      'scss',
      'css-module',
      'less-module',
      'scss-module'
    ].forEach((ruleName) => {
      const rule = config.module.rule(ruleName);

      if (rule.uses.has('MiniCssExtractPlugin.loader')) {
        rule.uses.delete('MiniCssExtractPlugin.loader');
      }
    });
  }
};
