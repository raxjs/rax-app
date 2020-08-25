const { resolve } = require('path');
const { copySync } = require('fs-extra');
const chokidar = require('chokidar');
const { isNativePage, removeExt } = require('../../config/pathHelper');

/**
 * Copy directories from rootDir + `src/${dir}` to outputPath + `${dir}`
 * @param {string[]} constantDirectories
 * @param {string} rootDir
 * @param {string} outputPath
 * @param {string} target
 * @param {boolean} disableCopyNpm
 *
 */
function copyPublicFile(constantDirectories, rootDir, outputPath, target, disableCopyNpm) {
  for (let srcDir of constantDirectories) {
    const srcPath = resolve(rootDir, srcDir);
    const distPath = resolve(outputPath, srcDir.split('/').slice(1).join('/'));
    copySync(srcPath, distPath, {
      filter: (file) => {
        if (disableCopyNpm) return true; // If disableCopyNpm, all js files should be copied
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
  constructor({ mode = 'build', rootDir = '', outputPath = '', constantDirectories = [], target, disableCopyNpm = false }) {
    this.mode = mode;
    this.rootDir = rootDir;
    this.outputPath = outputPath;
    this.constantDirectories = constantDirectories;
    this.target = target;
    this.disableCopyNpm = disableCopyNpm;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      'CopyPublicFilePlugin',
      (compilation, callback) => {
        if (this.mode === 'build') {
          copyPublicFile(this.constantDirectories, this.rootDir, this.outputPath, this.target, this.disableCopyNpm);
        } else {
          const constantDirectoryPaths = this.constantDirectories.map(dirPath => resolve(this.rootDir, dirPath));
          const watcher = chokidar.watch(constantDirectoryPaths);
          watcher.on('all', () => {
            copyPublicFile(this.constantDirectories, this.rootDir, this.outputPath, this.target, this.disableCopyNpm);
          });
        }

        callback();
      }
    );
  }
};
