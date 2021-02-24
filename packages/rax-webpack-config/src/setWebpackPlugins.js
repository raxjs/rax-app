/* eslint-disable indent */
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

module.exports = (config) => {
  config
    .plugin('MiniCssExtractPlugin')
    .use(MiniCssExtractPlugin, [
      {
        filename: '[name].css',
      },
    ])
    .end()
    .plugin('FilterWarningsPlugin')
    .use(FilterWarningsPlugin, [
      {
        exclude: /Conflicting order between:/,
      },
    ])
    .end()
    .plugin('CaseSensitivePathsPlugin')
    .use(CaseSensitivePathsPlugin);
};
