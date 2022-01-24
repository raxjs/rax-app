const autoprefixer = require('autoprefixer');

module.exports = ({ onGetWebpackConfig }) => {
  onGetWebpackConfig((config) => {
    const styleRules = ['css', 'css-module', 'scss', 'scss-module', 'less', 'less-module'];

    styleRules.forEach((ruleName) => {
      config.module
        .rule(ruleName)
        .use('postcss-loader')
        .tap((options) => ({
          ...options,
          plugins: [autoprefixer],
        }));
    });
  });
};
