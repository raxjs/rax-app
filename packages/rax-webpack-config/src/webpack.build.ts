import * as TerserPlugin from 'terser-webpack-plugin';
import * as OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import * as safeParser from 'postcss-safe-parser';

export default (config) => {
  // disable devtool of mode prod build
  config.devtool(false);

  // uglify js file
  config.optimization
    .minimizer('TerserPlugin')
    .use(TerserPlugin, [{
      cache: true,
      parallel: true,
      extractComments: false,
      terserOptions: {
        output: {
          ascii_only: true,
          comments: 'some',
          beautify: false,
        },
        mangle: true,
      },
    }]);

  // optimize css file
  config.optimization
    .minimizer('OptimizeCSSAssetsPlugin')
    .use(OptimizeCSSAssetsPlugin, [{
      cssProcessorOptions: {
        cssDeclarationSorter: false,
        reduceIdents: false,
        parser: safeParser,
      },
    }]);
};
