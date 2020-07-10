const webpack = require('webpack');
const path = require('path');
const Chain = require('webpack-chain');
const { setBabelAlias } = require('rax-compile-config');
const getBabelConfig = require('rax-babel-config');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');


module.exports = (context, options) => {
  const { rootDir, command, pkg } = context;
  const { isES6 } = options || {};
  const config = new Chain();

  const babelConfig = getBabelConfig({
    styleSheet: true,
    isES6,
    custom: {
      ignore: ['**/**/*.d.ts'],
    },
  });

  setBabelAlias(config);

  config.target('web');
  config.context(rootDir);

  config.externals([
    function(ctx, request, callback) {
      if (request.indexOf('@weex-module') !== -1) {
        return callback(null, `commonjs ${request}`);
      }
      // Built-in modules in QuickApp
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
    .test(/\.tsx?$/)
    .use('babel')
    .loader(require.resolve('babel-loader'))
    .options(babelConfig)
    .end()
    .use('ts')
    .loader(require.resolve('ts-loader'));

  config.module
    .rule('md')
    .test(/\.md$/)
    .use('babel')
    .loader(require.resolve('babel-loader'))
    .options(babelConfig)
    .end()
    .use('markdown-loader')
    .loader(require.resolve('../loaders/MarkdownLoader/index'));

  config.module
    .rule('assets')
    .test(/\.(svg|png|webp|jpe?g|gif)$/i)
    .use('source')
    .loader(require.resolve('image-source-loader'));

  config.plugin('caseSensitivePaths').use(CaseSensitivePathsPlugin);

  config.plugin('noError').use(webpack.NoEmitOnErrorsPlugin);

  if (command === 'start') {
    config.mode('development');
    config.devtool('inline-module-source-map');
  } else if (command === 'build') {
    config.mode('production');

    config.optimization
      .minimizer('terser')
      .use(TerserPlugin, [
        {
          terserOptions: {
            output: {
              ascii_only: true,
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

  if (pkg.name) {
    config.resolve.alias.set(pkg.name, path.resolve(rootDir, 'src/index'));
  }

  return config;
};
