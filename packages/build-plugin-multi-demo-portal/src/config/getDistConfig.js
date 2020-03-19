const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const getBaseWebpack = require('./getBaseWebpack');
const getDemos = require('./utils/getDemos');

module.exports = context => {
  const config = getBaseWebpack(context);
  const { rootDir } = context;
  const demos = getDemos(rootDir);

  config.target('web');

  demos.forEach(demo => {
    const { name, filePath } = demo;

    config.entry(name).add(filePath);

    config.plugin(`html4${name}`).use(HtmlWebpackPlugin, [
      {
        inject: false,
        filename: `demo/${name}.html`,
        jsPath: `../${name}.js`,
        chunks: [name],
        template: path.resolve(__dirname, './demo.html'),
      },
    ]);
  });

  config.output
    .libraryTarget('umd')
    .filename('[name].js');

  config.externals([
    function(ctx, request, callback) {
      if (request.indexOf('@weex-module') !== -1) {
        return callback(null, `commonjs ${request}`);
      }
      callback();
    },
  ]);

  config.module
    .rule('css')
    .test(/\.css?$/)
    .use('css')
    .loader(require.resolve('stylesheet-loader'));

  config.module
    .rule('less')
    .test(/\.less?$/)
    .use('css')
    .loader(require.resolve('stylesheet-loader'))
    .end()
    .use('less')
    .loader(require.resolve('less-loader'));

  config.plugin('minicss').use(MiniCssExtractPlugin, [
    {
      filename: '[name].css',
    },
  ]);

  config.plugin('html').use(HtmlWebpackPlugin, [
    {
      inject: true,
      filename: 'index.html',
      chunks: ['portal'],
      template: path.resolve(__dirname, './portal.html'),
    },
  ]);

  return config;
};
