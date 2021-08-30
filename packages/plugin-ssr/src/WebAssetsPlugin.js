const { setChunkInfo } = require('./utils/chunkInfo');

const PLUGIN_NAME = 'WebAssetsPlugin';

module.exports = class WebAssetsPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      const chunkInfo = {};
      [...compilation.chunks].forEach((chunk) => {
        const files = [...chunk.files];
        chunkInfo[chunk.name.replace('.chunk', '')] = {
          js: files.filter(filepath => /\.js$/.test(filepath)),
          css: files.filter(filepath => /\.css$/.test(filepath)),
        };
      });
      setChunkInfo(chunkInfo);
      callback();
    });
  }
};
