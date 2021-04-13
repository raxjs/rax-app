const { resolve } = require('path');
const { copySync } = require('fs-extra');

module.exports = class CopyBuildResultPlugin {
  constructor({ target, mode = 'build', rootDir = '', outputPath = '' }) {
    this.target = target;
    this.mode = mode;
    this.rootDir = rootDir;
    this.outputPath = outputPath;
  }

  apply(compiler) {
    compiler.hooks.done.tapAsync('CopyBuildResultPlugin', (compilation, callback) => {
      if (this.mode === 'build') {
        const demoPluginFolder = resolve(this.rootDir, 'demo', this.target, 'plugin');
        copySync(this.outputPath, demoPluginFolder);
      }
      callback();
    });
  }
};
