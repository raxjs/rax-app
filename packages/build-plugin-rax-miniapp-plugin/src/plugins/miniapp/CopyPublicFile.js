const { resolve } = require('path');
const { copySync } = require('fs-extra');
const chokidar = require('chokidar');


function copyFile(srcPath, distPath) {
  copySync(srcPath, distPath, {
    filter: (file) => !/\.js$/.test(file)
  });
}

/**
 * Copy public directories to dist
 */
module.exports = class CopyPublicFilePlugin {
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

        if (this.mode === 'build') {
          copyFile(publicFilePath, distPublicFilePath);
        } else {
          const publicWatcher = chokidar.watch(publicFilePath);
          publicWatcher.on('all', () => {
            copyFile(publicFilePath, distPublicFilePath);
          });
        }
        callback();
      }
    );
  }
};
