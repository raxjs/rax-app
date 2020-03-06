const transformAppConfig = require('./transformAppConfig');
const { dirname, join } = require('path');
const { readJSONSync } = require('fs-extra');
const safeWriteFile = require('./safeWriteFile');

const PluginName = 'MiniAppConfigPlugin';

module.exports = class MiniAppConfigPlugin {
  constructor(passedOptions) {
    this.options = passedOptions;
  }
  apply(compiler) {
    const { resourcePath, outputPath, target, type } = this.options;
    compiler.hooks.emit.tapAsync(PluginName, (compilation, callback) => {
      const appConfig = readJSONSync(resourcePath);
      const config = transformAppConfig(dirname(resourcePath), appConfig, target);

      safeWriteFile(join(outputPath, 'app.json'), config, true);
      if (type === 'complie') {
        safeWriteFile(join(outputPath, 'app.config.js'), `module.exports = ${JSON.stringify(appConfig, null, 2)}`);
      }
      callback();
    });
  }
};
