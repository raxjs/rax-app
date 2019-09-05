const webpack = require('webpack');
const Chain = require('webpack-chain');
const babelMerge = require('babel-merge');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { getBabelConfig, setBabelAlias } = require('rax-compile-config');

const babelConfig = getBabelConfig();

module.exports = (context) => {
  const { rootDir, command , userConfig} = context;
  const { analyzer } = userConfig;
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

  config.plugin('copyWebpackPlugin')
    .use(CopyWebpackPlugin, [[{ from: 'src/public', to: 'public' }]]);

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

    if(analyzer){
      // 开启https://www.npmjs.com/package/webpack-bundle-analyzer
      config.plugin('BundleAnalyzerPlugin')
        .use(BundleAnalyzerPlugin)
    }
      
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
  }

  return config;
};

function addHotLoader(originConfig) {
  return babelMerge.all([{
    plugins: [require.resolve('rax-hot-loader/babel')],
  }, originConfig]);
}
