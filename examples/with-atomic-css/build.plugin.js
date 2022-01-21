const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

module.exports = ({ onGetWebpackConfig }) => {
  onGetWebpackConfig((config) => {
    const styleRules = [
      'css',
      'css-module',
      // 'css-global',
      'scss',
      'scss-module',
      // 'scss-global',
      'less',
      'less-module',
      // 'less-global',
    ];

    styleRules.forEach((ruleName) => {
      config.module
        .rule(ruleName)
        .use('postcss-loader')
        .tap((options) => ({
          ...options,
          plugins: [tailwindcss, autoprefixer],
        }));
    });
  });
};
