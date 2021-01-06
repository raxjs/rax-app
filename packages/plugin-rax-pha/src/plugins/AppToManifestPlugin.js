/**
 * app.json to manifest.json plugin
 */

const { RawSource } = require('webpack-sources');
const { transformAppConfig, setRealUrlToManifest } = require('../manifestHelpers');

const PLUGIN_NAME = 'PHA_AppToManifestPlugin';

module.exports = class {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    const { api, appWorkerPath } = this.options;
    const { context, getValue } = api;
    const { command } = context;

    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      compiler.hooks.emit.intercept({
        name: PLUGIN_NAME,
        context: true,
        call: () => {
          const appConfig = getValue('staticConfig');
          let manifestJSON = transformAppConfig(appConfig);


          if (appWorkerPath) {
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
