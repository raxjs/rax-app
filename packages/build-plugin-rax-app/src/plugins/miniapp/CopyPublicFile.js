const { resolve } = require('path');
const { copySync } = require('fs-extra');
const chokidar = require('chokidar');

/**
 * Copy directories from rootDir + `src/${dir}` to outputPath + `${dir}`
 * @param {array<string>} constantDirectories
 * @param {string} rootDir
 * @param {string} outputPath
 */
function copyPublicFile(constantDirectories, rootDir, outputPath) {
  for (let srcDir of constantDirectories) {
    const srcPath = resolve(rootDir, srcDir);
    const distPath = resolve(outputPath, srcDir.split('/').slice(1).join('/'));
    copySync(srcPath, distPath, {
      filter: (file) => !/\.js$/.test(file)
    });
  }
}

/**
 * Copy public directories to dist
 */
module.exports = class CopyPublicFilePlugin {
  constructor({ mode = 'build', rootDir = '', outputPath = '', constantDirectories = [] }) {
    this.mode = mode;
    this.rootDir = rootDir;
    this.outputPath = outputPath;
    this.constantDirectories = constantDirectories;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      'CopyPublicFilePlugin',
      (compilation, callback) => {
        if (this.mode === 'build') {
          copyPublicFile(this.constantDirectories, this.rootDir, this.outputPath);
        } else {
          const constantDirectoryPaths = this.constantDirectories.map(dirPath => resolve(this.rootDir, dirPath));
          const watcher = chokidar.watch(constantDirectoryPaths);
          watcher.on('all', () => {
            copyPublicFile(this.constantDirectories, this.rootDir, this.outputPath);
          });
        }

        callback();
      }
    );
  }
};
