/* eslint-disable indent */
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import * as FilterWarningsPlugin from 'webpack-filter-warnings-plugin';
import * as CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';

export default (config) => {
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
