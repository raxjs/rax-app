/* eslint-disable indent */
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const SimpleProgressPlugin = require('webpack-simple-progress-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

module.exports = (config) => {
  config
    .plugin('FilterWarningsPlugin')
      .use(FilterWarningsPlugin, [{
        exclude: /Conflicting order between:/,
      }])
      .end()
    .plugin('SimpleProgressPlugin')
      .use(SimpleProgressPlugin)
      .end()
    .plugin('CaseSensitivePathsPlugin')
      .use(CaseSensitivePathsPlugin);
};
