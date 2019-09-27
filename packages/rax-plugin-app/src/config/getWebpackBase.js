const webpack = require('webpack');
const Chain = require('webpack-chain');
const fs = require('fs-extra');
const path = require('path');
const babelMerge = require('babel-merge');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { getBabelConfig, setBabelAlias } = require('rax-compile-config');

const babelConfig = getBabelConfig({
  styleSheet: true,
});

module.exports = (context) => {
  const { rootDir, command } = context;
  const config = new Chain();

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
    .type("javascript/auto")
    .test(/app\.json$/)
    .use('babel')
    .loader(require.resolve('babel-loader'))
    .options(babelConfig)
    .end()
    .use('loader')
    .loader(require.resolve('../loaders/AppConfigLoader'))

  config.module.rule('jsx')
    .test(/\.(js|mjs|jsx)$/)
    .use('babel')
    .loader(require.resolve('babel-loader'))
    .options(babelConfig);

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
    });

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

  if (command === 'dev') {
    config.mode('development');
    config.devtool('inline-module-source-map');

    config.module.rule('jsx')
      .use('babel')
      .tap(opt => addHotLoader(opt));

    config.module.rule('tsx')
      .use('babel')
      .tap(opt => addHotLoader(opt));
  } else if (command === 'build') {
    config.mode('production');
    config.devtool('source-map');

    config.optimization
      .minimizer('uglify')
      .use(UglifyJSPlugin, [{
        cache: true,
        sourceMap: true,
      }])
      .end()
      .minimizer('optimizeCSS')
      .use(OptimizeCSSAssetsPlugin, [{
        canPrint: true,
      }]);

    // max size: 100k/entry
    config.performance
      .hints('warning')
      .maxEntrypointSize(100000)
      .maxAssetSize(300000)
      .assetFilter(filename => /\.m?js$/.test(filename));
  }
  
  return config;
};

function addHotLoader(originConfig) {
  return babelMerge.all([{
    plugins: [require.resolve('rax-hot-loader/babel')],
  }, originConfig]);
}
