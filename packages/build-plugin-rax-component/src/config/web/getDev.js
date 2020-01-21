const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { hmrClient } = require('rax-compile-config');
const getBaseWebpack = require('../getBaseWebpack');
const getDemos = require('../getDemos');

module.exports = (context, options) => {
  const config = getBaseWebpack(context);
  const { rootDir } = context;
  const demos = getDemos(rootDir);

  demos.forEach(({ name, filePath }) => {
    config
      .entry(name)
      .add(hmrClient)
      .add(filePath);

    config.plugin(`html4${name}`).use(HtmlWebpackPlugin, [
      {
        inject: true,
        filename: demos.length === 1 && name === 'index' ? 'index.html' : name,
        chunks: [name],
        template: path.resolve(__dirname, '../demo.html'),
      },
    ]);
  });

  config.output.filename('[name].js');

  if (options.forceInline) {
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
  } else {
    config.module
      .rule('css')
      .test(/\.css?$/)
      .use('style')
      .loader(require.resolve('style-loader'))
      .end()
      .use('css')
      .loader(require.resolve('css-loader'))
      .end()
      .use('postcss')
      .loader(require.resolve('postcss-loader'))
      .options({
        ident: 'postcss',
        plugins: () => [
          require('postcss-preset-env')({
            autoprefixer: {
              flexbox: 'no-2009',
            },
            stage: 3,
          }),
          require('postcss-plugin-rpx2vw')(),
        ],
      });

    config.module
      .rule('less')
      .test(/\.less?$/)
      .use('style')
      .loader(require.resolve('style-loader'))
      .end()
      .use('css')
      .loader(require.resolve('css-loader'))
      .end()
      .use('postcss')
      .loader(require.resolve('postcss-loader'))
      .options({
        ident: 'postcss',
        plugins: () => [
          require('postcss-preset-env')({
            autoprefixer: {
              flexbox: 'no-2009',
            },
            stage: 3,
          }),
          require('postcss-plugin-rpx2vw')(),
        ],
      })
      .end()
      .use('less')
      .loader(require.resolve('less-loader'));
  }

  return config;
};
