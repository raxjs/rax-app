/* eslint-disable indent */
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

module.exports = (config) => {
  config
    .plugin('FilterWarningsPlugin')
      .use(FilterWarningsPlugin, [{
        exclude: /Conflicting order between:/,
      }])
      .end()
    .plugin('CaseSensitivePathsPlugin')
      .use(CaseSensitivePathsPlugin);
};
