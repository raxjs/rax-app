const { resolve } = require('path');
const { copySync } = require('fs-extra');
const chokidar = require('chokidar');

/**
 * Copy public directories to dist
 */
module.exports = class JSX2MPRuntimePlugin {
  constructor({ mode = 'build', rootDir = '', outputPath = '' }) {
    this.mode = mode;
    this.rootDir = rootDir;
    this.outputPath = outputPath;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      'CopyPublicFilePlugin',
      (compilation, callback) => {
        const publicFilePath = resolve(this.rootDir, 'src/public');
        const distPublicFilePath = resolve(this.outputPath, 'public');
        function copyPublicFile() {
          copySync(publicFilePath, distPublicFilePath, {
            filter: (src) => !/\.js$/.test(src)
          });
        }
        if (this.mode === 'build') {
          copyPublicFile();
        } else {
          const watcher = chokidar.watch(publicFilePath);
          watcher.on('all', () => {
            copyPublicFile();
          });
        }

        callback();
      }
    );
  }
};
