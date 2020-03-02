const { RawSource } = require('webpack-sources');
const { minify } = require('html-minifier');
const { decamelize } = require('humps');
const fs = require('fs-extra');
const path = require('path');

const PLUGIN_NAME = 'PHA_AppConfigToManifestPlugin';

const retainKeys = ['name', 'display', 'icons', 'appWorker', 'window', 'tabHeader', 'tabBar', 'pages'];

module.exports = class AppConfigToManifestPlugin {
  constructor(options) {
    this.options = options;
    this.manifestData = {};
    this.appConfig = {};
  }

  transformAppConfig(appConfig, isRoot) {
    this.appConfig = appConfig;
    const data = {};

    for (const key in appConfig) {
      // filter not need key
      if (isRoot && retainKeys.indexOf(key) === -1) {
        continue;
      }
      const transformKey = decamelize(key);
      const value = appConfig[key];
      if (key === 'window') {
        Object.assign(data, this.transformAppConfig(value));
      } else if (typeof value === 'string' || typeof value === 'number') {
        data[transformKey] = value;
      } else if (Array.isArray(value)) {
        data[transformKey] = value.map((item) => {
          return this.transformAppConfig(item);
        });
      } else if (typeof value === 'object') {
        data[transformKey] = this.transformAppConfig(value);
      }
    }

    return data;
  }

  apply(compiler) {
    const { context, appConfigWriteToHTML } = this.options;
    
    if (!appConfigWriteToHTML) {
      return;
    }

    const { rootDir } = context;
    const appConfig = fs.readJsonSync(path.resolve(rootDir, 'src/app.json'));
    if (appConfig.routes) {
      appConfig.pages = appConfig.routes;
    }
    this.manifestData = this.transformAppConfig(appConfig, true);
  
    compiler.hooks.emit.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      const manifestData = `var __manifestData__ = ${JSON.stringify(this.manifestData)};`;

      // In order to rendering faster, using inline script.
      compilation.assets['web/index.html'] = new RawSource(
        minify(
          compilation.assets['web/index.html'].source().replace('<head>', `<head><script>${manifestData}</script>`),
          { minifyJS: true },
        ),
      );
      callback();
    });
  }
};