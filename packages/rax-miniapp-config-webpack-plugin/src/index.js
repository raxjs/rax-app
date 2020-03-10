const transformAppConfig = require('./transformAppConfig');
const { join } = require('path');
const safeWriteFile = require('./safeWriteFile');

const PluginName = 'MiniAppConfigPlugin';

module.exports = class MiniAppConfigPlugin {
  constructor(passedOptions) {
    this.options = passedOptions;
  }
  apply(compiler) {
    const { outputPath, appConfig, target, type } = this.options;
    compiler.hooks.emit.tapAsync(PluginName, (compilation, callback) => {
      const config = transformAppConfig(outputPath, appConfig, target);

      safeWriteFile(join(outputPath, 'app.json'), config, true);
      if (type === 'complie') {
        safeWriteFile(join(outputPath, 'app.config.js'), `module.exports = ${JSON.stringify(appConfig, null, 2)}`);
      }
      callback();
    });
  }
};
