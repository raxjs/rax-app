const transformAppConfig = require('./transformAppConfig');
const { join, resolve } = require('path');
const { ensureDirSync, pathExistsSync, readFileSync } = require('fs-extra');
const safeWriteFile = require('./safeWriteFile');
const adaptConfig = require('./adaptConfig');
const { BYTEDANCE_MICROAPP } = require('./constants');

const PluginName = 'MiniAppConfigPlugin';

module.exports = class MiniAppConfigPlugin {
  constructor(passedOptions) {
    this.options = passedOptions;
  }
  apply(compiler) {
    // Currently there is no watch app.json capacity, so use first render flag handle repeatly write config
    let isFirstRender = true;
    let { outputPath, appConfig, target, type, getAppConfig, entryPath } = this.options;
    compiler.hooks.beforeCompile.tapAsync(PluginName, (compilation, callback) => {
      if (isFirstRender) {
        transformConfig(compilation, callback);
        isFirstRender = false;
      } else {
        callback();
      }
    });

    function transformConfig(compilation, callback) {
      const config = transformAppConfig(outputPath, appConfig, target);
      safeWriteFile(join(outputPath, 'app.json'), config, true);
      if (type === 'complie') {
        safeWriteFile(join(outputPath, target === 'quickapp' ? 'appConfig.js' : 'app.config.js'), `module.exports = ${JSON.stringify(appConfig, null, 2)}`);
      }
      // add project json
      if (target === BYTEDANCE_MICROAPP) {
        const projectPath = join(entryPath, '../', 'project.config.json');
        try {
          const content = readFileSync(projectPath);
          safeWriteFile(join(outputPath, 'project.config.json'), content);
        } catch (err) {
          safeWriteFile(join(outputPath, 'project.config.json'),
            `{
              "setting": {
                "es6": true
              }
            }`);
        }
      }
      // Transform page config
      config.pages.map((page, index) => {
        const route = appConfig.routes[index];
        if (route && route.window) {
          ensureDirSync(outputPath);
          safeWriteFile(join(outputPath, page + '.json'), adaptConfig(route.window, 'window', target), true);
        }
      });
      callback();
    }
  }
};


