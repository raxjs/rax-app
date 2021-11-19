import { setChunkInfo } from './utils/chunkInfo';

const PLUGIN_NAME = 'WebAssetsPlugin';

export default class WebAssetsPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      const chunkInfo = {};
      [...compilation.chunks].forEach((chunk) => {
        const files = [...chunk.files];
        if (chunk.name) {
          chunkInfo[chunk.name.replace('.chunk', '')] = {
            js: files.filter((filepath) => /\.js$/.test(filepath)),
            css: files.filter((filepath) => /\.css$/.test(filepath)),
          };
        }
      });
      setChunkInfo(chunkInfo);
      callback();
    });
  }
}
