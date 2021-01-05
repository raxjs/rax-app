/**
 * app.json to manifest.json plugin
 */

const fs = require('fs-extra');
const path = require('path');
const { RawSource } = require('webpack-sources');
const { transformAppConfig, setRealUrlToManifest } = require('../manifestHelpers');

const PLUGIN_NAME = 'PHA_AppToManifestPlugin';

module.exports = class {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    const { api } = this.options;
    const { context, getValue } = api;
    const { command, rootDir } = context;

    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      compiler.hooks.emit.intercept({
        name: PLUGIN_NAME,
        context: true,
        call: () => {
          const appConfig = getValue('staticConfig');
          let manifestJSON = transformAppConfig(appConfig);

          const appWorkerJSPath = path.resolve(rootDir, 'src/pha-worker.js');
          const appWorkerTSPath = path.resolve(rootDir, 'src/pha-worker.ts');

          if (fs.pathExistsSync(appWorkerJSPath) || fs.pathExistsSync(appWorkerTSPath)) {
            manifestJSON.app_worker = manifestJSON.app_worker || {};

            if (!manifestJSON.app_worker.url) {
              manifestJSON.app_worker.url = 'pha-worker.js';
            }
          }

          if (command === 'start') {
            const urlPrefix = `${getValue('devUrlPrefix')}/`;
            manifestJSON = setRealUrlToManifest(urlPrefix, manifestJSON);
          }
          compilation.assets['manifest.json'] = new RawSource(JSON.stringify(manifestJSON));
        },
      });
    });
  }
};
