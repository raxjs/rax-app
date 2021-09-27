/* eslint-disable indent */
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import * as FilterWarningsPlugin from '@builder/pack/deps/webpack-filter-warnings-plugin';
import * as CaseSensitivePathsPlugin from '@builder/pack/deps/case-sensitive-paths-webpack-plugin';

// eslint-disable-next-line
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
