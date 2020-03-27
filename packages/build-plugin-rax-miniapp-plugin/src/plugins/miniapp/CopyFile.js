const { resolve } = require('path');
const { copySync } = require('fs-extra');
const chokidar = require('chokidar');

/**
 * Copy public directories to dist
 */
module.exports = class JSX2MPRuntimePlugin {
  constructor({ mode = 'build', rootDir = '', outputPath = '', isPublicFileExist = false }) {
    this.mode = mode;
    this.rootDir = rootDir;
    this.outputPath = outputPath;
    this.isPublicFileExist = isPublicFileExist;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      'CopyPublicFilePlugin',
      (compilation, callback) => {
        const pluginFilePath = resolve(this.rootDir, 'src', 'plugin.json');
        const distPluginFilePath = resolve(this.outputPath, 'plugin.json');

        const publicFilePath = resolve(this.rootDir, 'src/public');
        const distPublicFilePath = resolve(this.outputPath, 'public');

        function copyFile(type = 'plugin') {
          switch (type) {
            case 'plugin':
              copySync(pluginFilePath, distPluginFilePath);
              break;
            case 'public':
              copySync(publicFilePath, distPublicFilePath, {
                filter: (src) => !/\.js$/.test(src)
              });
              break;
          }
        }
        if (this.mode === 'build') {
          copyFile('plugin');
          if (this.isPublicFileExist) {
            copyFile('public');
          }
        } else {
          const pluginWatcher = chokidar.watch(pluginFilePath);
          pluginWatcher.on('all', () => {
            copyFile('plugin');
          });
          if (this.isPublicFileExist) {
            const publicWatcher = chokidar.watch(publicFilePath);
            publicWatcher.on('all', () => {
              copyFile('public');
            });
          }
        }
        callback();
      }
    );
  }
};
