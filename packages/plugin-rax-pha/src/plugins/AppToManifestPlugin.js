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
    const {
      api,
      isTemplate,
      builtInLibrary,
      appWorkerPath,
    } = this.options;
    let {
      cdnPrefix = '',
      pagePrefix = '',
      pageSuffix,
    } = this.options;
    const { context, getValue } = api;
    const { command, rootDir, userConfig = {} } = context;
    const { inlineStyle } = userConfig;

    compiler.hooks.emit.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      const appConfig = getValue('staticConfig');
      let manifestJSON = transformAppConfig(appConfig);
      const isStart = command === 'start';

      if (appWorkerPath) {
        manifestJSON.app_worker = manifestJSON.app_worker || {};

        if (!manifestJSON.app_worker.url) {
          manifestJSON.app_worker.url = 'pha-worker.js';
        }
      }

      if (builtInLibrary && builtInLibrary.length > 0) {
        manifestJSON.built_in_library = builtInLibrary;
      }
      if (isStart) {
        cdnPrefix = `${getValue('devUrlPrefix')}/`;
        pagePrefix = cdnPrefix;
        pageSuffix = '.html';
      }
      manifestJSON = setRealUrlToManifest({
        urlPrefix: pagePrefix,
        urlSuffix: pageSuffix,
        cdnPrefix,
        isTemplate,
        inlineStyle,
        api,
      }, manifestJSON);
      compilation.assets['manifest.json'] = new RawSource(JSON.stringify(manifestJSON));
      callback();
    });
  }
};
