const { RawSource } = require('webpack-sources');
const { minify } = require('html-minifier');
const fs = require('fs-extra');
const path = require('path');
const manifestHelpers = require('../manifestHelpers');

const { transformAppConfig, getPageManifestByPath } = manifestHelpers;

const PLUGIN_NAME = 'PHA_AppConfigToManifestPlugin';

// transform data to string
function stringifyData(list) {
  // use JSON.stringify html parse error
  return JSON.stringify(list).replace(/"/g, '\'');
}

module.exports = class AppConfigToManifestPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    const { context, appConfigWriteToHTML, nsr } = this.options;
    const enableNSR = nsr && nsr.enable;

    if (!appConfigWriteToHTML && !enableNSR) {
      return;
    }

    const { rootDir } = context;
    const appConfig = fs.readJsonSync(path.resolve(rootDir, 'src/app.json'));
    const decamelizeAppConfig = transformAppConfig(appConfig);
    compiler.hooks.emit.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      if (appConfig.routes && appConfig.routes.length > 0) {
        appConfig.routes.map((router) => {
          const { path } = router;
          const rootDir = 'web';
          const assetPath = path === '/' ? `${rootDir}/index.html` : `${rootDir}/${path.replace(/^\/|\/$/g, '')}/index.html`;
          const originSource = compilation.assets[assetPath].source();
          const pageManifestData = getPageManifestByPath({
            ...this.options,
            path,
            decamelizeAppConfig
          });
          const manifestData = `var __MANIFEST_Data__ = ${JSON.stringify(pageManifestData)};`;
          let source = originSource.replace('<head>', `<head><script>${manifestData}</script>`);

          if (enableNSR) {
            const { dataConfig = 'static' } = nsr;
            const { data_prefetches } = pageManifestData;
            // inject nsr meta
            source = source.replace('<head>', `<head><meta name="nsr" content="source" /><meta name="nsr_script" content="${pageManifestData.nsr_script}" />`);
            if (dataConfig === 'static' && data_prefetches) {
              // prefetch data is simple, generate meta
              source = source.replace('<head>', `<head><meta name="nsr_data" content="${stringifyData(data_prefetches)}" />`);
            }
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