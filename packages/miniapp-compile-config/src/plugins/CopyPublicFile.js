const { resolve } = require('path');
const { copySync } = require('fs-extra');
const chokidar = require('chokidar');
const { pathHelper: { isNativePage, removeExt } } = require('miniapp-builder-shared');

/**
 * Copy directories from rootDir + `src/${dir}` to outputPath + `${dir}`
 * @param {string[]} constantDir
 * @param {string} rootDir
 * @param {string} outputPath
 */
function copyPublicFile(constantDir, rootDir, outputPath, target) {
  for (let srcDir of constantDir) {
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
  constructor({ mode = 'build', rootDir = '', outputPath = '', constantDir = [], target }) {
    this.mode = mode;
    this.rootDir = rootDir;
    this.outputPath = outputPath;
    this.constantDir = constantDir;
    this.target = target;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      'CopyPublicFilePlugin',
      (compilation, callback) => {
        if (this.mode === 'build') {
          copyPublicFile(this.constantDir, this.rootDir, this.outputPath, this.target);
        } else {
          const constantDirectoryPaths = this.constantDir.map(dirPath => resolve(this.rootDir, dirPath));
          const watcher = chokidar.watch(constantDirectoryPaths);
          watcher.on('all', () => {
            copyPublicFile(this.constantDir, this.rootDir, this.outputPath, this.target);
          });
        }

        callback();
      }
    );
  }
};
