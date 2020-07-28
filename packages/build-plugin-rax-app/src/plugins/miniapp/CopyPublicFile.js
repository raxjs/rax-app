const { resolve, sep } = require('path');
const { copySync } = require('fs-extra');
const chokidar = require('chokidar');
const { isNativePage, removeExt } = require('../../config/pathHelper');

/**
 * Copy directories from rootDir + `src/${dir}` to outputPath + `${dir}`
 * @param {array<string>} constantDirectories
 * @param {string} rootDir
 * @param {string} outputPath
 */
function copyPublicFile(constantDirectories, rootDir, outputPath, target) {
  for (let srcDir of constantDirectories) {
    const srcPath = resolve(rootDir, srcDir);
    const distPath = resolve(outputPath, srcDir.split('/').slice(1).join('/'));
    copySync(srcPath, distPath, {
      filter: (file) => {
        if (/\.js$/.test(file)) {
          return isNativePage(removeExt(file), target);
        }
        return true;
      }
    });
  }
}

/**
 * Copy public directories to dist
 */
module.exports = class CopyPublicFilePlugin {
  constructor({ mode = 'build', rootDir = '', outputPath = '', constantDirectories = [], target }) {
    this.mode = mode;
    this.rootDir = rootDir;
    this.outputPath = outputPath;
    this.constantDirectories = constantDirectories;
    this.target = target;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      'CopyPublicFilePlugin',
      (compilation, callback) => {
        if (this.mode === 'build') {
          copyPublicFile(this.constantDirectories, this.rootDir, this.outputPath, this.target);
        } else {
          const constantDirectoryPaths = this.constantDirectories.map(dirPath => resolve(this.rootDir, dirPath));
          const watcher = chokidar.watch(constantDirectoryPaths);
          watcher.on('all', () => {
            copyPublicFile(this.constantDirectories, this.rootDir, this.outputPath, this.target);
          });
        }

        callback();
      }
    );
  }
};
