const { RawSource } = require('webpack-sources');
const { minify } = require('html-minifier');
const { decamelize } = require('humps');
const fs = require('fs-extra');
const path = require('path');

const PLUGIN_NAME = 'PHA_AppConfigToManifestPlugin';

const retainKeys = ['name', 'display', 'icons', 'appWorker', 'window', 'tabHeader', 'tabBar', 'pages', 'dataPrefetches'];

module.exports = class AppConfigToManifestPlugin {
  constructor(options) {
    this.options = options;
    this.decamelizeAppConfig = {};
    this.appConfig = {};
  }

  // transform app config to
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
      } else {
        data[transformKey] = value;
      }
    }

    return data;
  }

  // get every page manifest
  getPageManifestByPath(path) {
    const { nsr } = this.options;
    let manifestData = {};
    const { pages = [] } = this.decamelizeAppConfig;
    const page = pages.find((item) => {
      return item.path === path;
    });

    if (!page) {
      return manifestData;
    }

    manifestData = {
      ...this.decamelizeAppConfig,
      ...page
    };

    // inject nsr_script
    if (nsr) {
      manifestData.nsr_script = `/nsr${path === '/' ? '' : path}/index.js`;
    }
    // if current page is not frame page
    // delete tabbar/tabHeader/pages
    if (!page.frame) {
      delete manifestData.tab_bar;
      delete manifestData.tab_header;
      delete manifestData.pages;
    }
    delete manifestData.source;

    return manifestData;
  }

  apply(compiler) {
    const { context, appConfigWriteToHTML, nsr } = this.options;

    if (!appConfigWriteToHTML && !nsr) {
      return;
    }

    const { rootDir } = context;
    const appConfig = fs.readJsonSync(path.resolve(rootDir, 'src/app.json'));
    if (appConfig.routes) {
      appConfig.pages = appConfig.routes;
    }
    this.decamelizeAppConfig = this.transformAppConfig(appConfig, true);
    compiler.hooks.emit.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      if (appConfig.routes && appConfig.routes.length > 0) {
        appConfig.routes.map((router) => {
          const { path } = router;
          const rootDir = 'web';
          const assetPath = path === '/' ? `${rootDir}/index.html` : `${rootDir}/${path.replace(/^\/|\/$/g, '')}/index.html`;
          const originSource = compilation.assets[assetPath].source();
          // In order to rendering faster, using inline script.
          const manifestData = `var __manifestData__ = ${JSON.stringify(this.getPageManifestByPath(path))};`;
          let source = originSource.replace('<head>', `<head><script>${manifestData}</script>`);

          if (nsr) {
            // inject nsr meta
            source = source.replace('<head>', '<head><meta name="nsr" content="source" />');
          }
          compilation.assets[assetPath] = new RawSource(
            minify(
              source,
              { minifyJS: true },
            ),
          );
        });
      }

      callback();
    });
  }
};