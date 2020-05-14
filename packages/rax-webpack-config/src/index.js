const webpack = require('webpack');
const path = require('path');
const Chain = require('webpack-chain');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = (context) => {
  const { rootDir, command, babelConfig } = context;
  const config = new Chain();

  config.resolve.alias
    .set('babel-runtime-jsx-plus', require.resolve('babel-runtime-jsx-plus'))
    // @babel/runtime has no index
    .set('@babel/runtime', path.dirname(require.resolve('@babel/runtime/package.json')));

  config.target('web');
  config.context(rootDir);
  config.externals([
    function(ctx, request, callback) {
      if (request.indexOf('@weex-module') !== -1) {
        return callback(null, `commonjs ${request}`);
      }
      // compatible with @system for quickapp
      if (request.indexOf('@system') !== -1) {
        return callback(null, `commonjs ${request}`);
      }
      callback();
    },
  ]);

  config.resolve.extensions.merge(['.js', '.json', '.jsx', '.ts', '.tsx', '.html']);
  config.module
    .rule('jsx')
    .test(/\.(js|mjs|jsx)$/)
    .use('babel')
    .loader(require.resolve('babel-loader'))
    .options(babelConfig);

  config.module
    .rule('tsx')
    .test(/\.(ts|tsx)?$/)
    .use('babel')
    .loader(require.resolve('babel-loader'))
    .options(babelConfig)
    .end()
    .use('ts')
    .loader(require.resolve('ts-loader'));

  config.module
    .rule('assets')
    .test(/\.(svg|png|webp|jpe?g|gif)$/i)
    .use('source')
    .loader(require.resolve('image-source-loader'));

  config.plugin('caseSensitivePaths').use(CaseSensitivePathsPlugin);

  config.plugin('noError').use(webpack.NoEmitOnErrorsPlugin);
  if (command === 'start') {
    config.mode('development');
    config.devtool('eval-cheap-source-map');
  } else if (command === 'build') {
    config.mode('production');

    config.optimization
      .minimizer('terser')
      .use(TerserPlugin, [
        {
          terserOptions: {
            output: {
              comments: false,
            },
          },
          extractComments: false,
        },
      ])
      .end()
      .minimizer('optimizeCSS')
      .use(OptimizeCSSAssetsPlugin);
  }
  return config;
};
