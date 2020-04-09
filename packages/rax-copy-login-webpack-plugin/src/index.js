const path = require('path');
const fs = require('fs-extra');

const PluginName = 'CopyLoginPlugin';

module.exports = class CopyLoginPlugin {
  constructor(passedOptions) {
    this.options = passedOptions;
  }
  apply(compiler) {
    let { outputPath, appConfig, platform } = this.options;
    compiler.hooks.beforeCompile.tapAsync(PluginName, copyLogin);
    function copyLogin(compilation, callback) {
      fs.copySync(path.join(__dirname, `assets/${platform}/Login`), path.join(outputPath, '/pages/Login'));
      appConfig.pages.push('pages/Login/index');
      callback();
    }
  }
};
