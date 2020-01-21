const webpack = require('webpack');
const Chain = require('webpack-chain');
const fs = require('fs-extra');
const path = require('path');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { getBabelConfig, setBabelAlias } = require('rax-compile-config');

module.exports = (context, options = {}) => {
  const { rootDir, command } = context;
  const config = new Chain();

  const babelConfig = getBabelConfig({
    styleSheet: true,
    ...options,
  });

  config.target('web');
  config.context(rootDir);

  setBabelAlias(config);

  config.resolve.extensions
    .merge(['.js', '.json', '.jsx', '.html', '.ts', '.tsx']);

  config.resolve.alias
    .set('@core/app', 'universal-app-runtime')
    .set('@core/page', 'universal-app-runtime')
    .set('@core/router', 'universal-app-runtime');

  // Process app.json file
  config.module.rule('appJSON')
    .type('javascript/auto')
    .test(/app\.json$/)
    .use('babel')
    .loader(require.resolve('babel-loader'))
    .options(babelConfig)
    .end()
    .use('loader')
    .loader(require.resolve('../loaders/AppConfigLoader'));

  config.module.rule('jsx')
    .test(/\.(js|mjs|jsx)$/)
    .use('babel')
    .loader(require.resolve('babel-loader'))
    .options(babelConfig)
    .end()
    .use('platform')
    .loader(require.resolve('rax-compile-config/src/platformLoader'));

  config.module.rule('tsx')
    .test(/\.(ts|tsx)?$/)
    .use('babel')
    .loader(require.resolve('babel-loader'))
    .options(babelConfig)
    .end()
    .use('ts')
    .loader(require.resolve('ts-loader'))
    .options({
      transpileOnly: true,
    })
    .end()
    .use('platform')
    .loader(require.resolve('rax-compile-config/src/platformLoader')); ;

  config.module.rule('assets')
    .test(/\.(svg|png|webp|jpe?g|gif)$/i)
    .use('source')
    .loader(require.resolve('image-source-loader'));

  config.plugin('caseSensitivePaths')
    .use(CaseSensitivePathsPlugin);

  if (fs.existsSync(path.resolve(rootDir, 'src/public'))) {
    config.plugin('copyWebpackPlugin')
      .use(CopyWebpackPlugin, [[{ from: 'src/public', to: 'public' }]]);
  }

  config.plugin('noError')
    .use(webpack.NoEmitOnErrorsPlugin);

  if (command === 'start') {
    config.mode('development');
    config.devtool('inline-module-source-map');
  } else if (command === 'build') {
    config.mode('production');

    config.optimization
      .minimizer('terser')
      .use(TerserPlugin, [{
        terserOptions: {
          output: {
            comments: false,
          },
        },
        extractComments: false,
      }])
      .end()
      .minimizer('optimizeCSS')
      .use(OptimizeCSSAssetsPlugin);
  }

  return config;
};
