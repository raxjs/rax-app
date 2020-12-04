/**
 * app.json to manifest.json plugin
 */

const fs = require('fs-extra');
const path = require('path');
const { RawSource } = require('webpack-sources');
const address = require('address');
const { transformAppConfig, setRealUrlToManifest } = require('../manifestHelpers');

const PLUGIN_NAME = 'PHA_AppToManifestPlugin';

module.exports = class {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    const { context } = this.options;
    const { command, rootDir, commandArgs } = context;

    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      compiler.hooks.emit.intercept({
        name: PLUGIN_NAME,
        context: true,
        call: () => {
          const appConfig = fs.readJsonSync(path.resolve(rootDir, 'src/app.json'));
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
            const protocol = commandArgs.https ? 'https' : 'http';
            const urlPrefix = `${protocol}://${ address.ip() }:${ commandArgs.port }/`;
            manifestJSON = setRealUrlToManifest(urlPrefix, manifestJSON);
          }
          compilation.assets['manifest.json'] = new RawSource(JSON.stringify(manifestJSON));
        },
      });
    });
  }
};
