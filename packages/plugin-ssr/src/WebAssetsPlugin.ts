import { setChunkInfo } from './utils/chunkInfo';

const PLUGIN_NAME = 'WebAssetsPlugin';

export default class WebAssetsPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      const entries = Object.keys(compiler.options.entry);
      const assetNames = Object.keys(compilation.assets).filter((name) => /\.js$/.test(name));
      const chunkInfo = {};
      entries.forEach((entry) => {
        // assetNames: ['home.hash.js']
        let assetName;
        assetNames.some((name) => {
          if (name.split('.').slice(0, -2).join('.') === entry) {
            assetName = name.replace(/\.js$/, '');
            return true;
          }
          return false;
        });
        chunkInfo[entry] = assetName;
      });
      setChunkInfo(chunkInfo);
      callback();
    });
  }
}
