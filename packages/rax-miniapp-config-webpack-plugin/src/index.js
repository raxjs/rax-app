const transformAppConfig = require('./transformAppConfig');
const { join } = require('path');
const safeWriteFile = require('./safeWriteFile');
const adaptConfig = require('./adaptConfig');

const PluginName = 'MiniAppConfigPlugin';

let called = false;

module.exports = class MiniAppConfigPlugin {
  constructor(passedOptions) {
    this.options = passedOptions;
  }
  apply(compiler) {
    let { outputPath, appConfig, target, type, getAppConfig } = this.options;
    compiler.hooks.watchRun.tapAsync(PluginName, (compilation, callback) => {
      if (called) {
        appConfig = getAppConfig(compilation.context, target);
      }
      called = true;
      const config = transformAppConfig(outputPath, appConfig, target);
      safeWriteFile(join(outputPath, 'app.json'), config, true);
      if (type === 'complie') {
        safeWriteFile(join(outputPath, 'app.config.js'), `module.exports = ${JSON.stringify(appConfig, null, 2)}`);
      }
      // Transform page config
      config.pages.map((page, index) => {
        const route = appConfig.routes[index];
        if (route && route.window) {
          safeWriteFile(join(outputPath, page + '.json'), adaptConfig(route.window, 'window', target), true);
        }
      });
      callback();
    });
  }
};
