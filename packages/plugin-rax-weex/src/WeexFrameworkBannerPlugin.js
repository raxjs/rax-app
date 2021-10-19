const webpackSources = require('webpack-sources');
const webpack = require('webpack');
const { processAssets, emitAsset } = require('@builder/compat-webpack4');

const { ConcatSource } = webpack.sources || webpackSources;

class WeexFrameworkBannerPlugin {
  constructor(options) {
    this.options = Object.assign({
      framework: 'Rax',
    }, options);
  }

  apply(compiler) {
    const frameworkComment = `// {"framework" : "${this.options.framework}"}`;
    processAssets({
      pluginName: 'WeexFrameworkBannerPlugin',
      compiler,
    }, ({ compilation, assets, callback }) => {
      Object.keys(assets).filter((filepath) => /\.js$/.test(filepath)).forEach((chunkName) => {
        const content = assets[chunkName].source();
        delete assets[chunkName];
        emitAsset(compilation, chunkName, new ConcatSource(
          frameworkComment,
          '\n',
          content,
        ));
      });
      callback();
    });
  }
}


module.exports = WeexFrameworkBannerPlugin;
