/**
 * app.json to manifest.json plugin
 */

const chalk = require('chalk');
const { RawSource } = require('webpack-sources');
const { getMpaEntries } = require('@builder/app-helpers');
const { transformAppConfig, setRealUrlToManifest } = require('../manifestHelpers');

const PLUGIN_NAME = 'PHA_AppToManifestPlugin';
const highlightPrint = chalk.hex('#F4AF3D');

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
    const { command, userConfig = {} } = context;
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

      console.log(highlightPrint('  [PHA] Development server at: '));
      // if has tabBar, do not generate multiple manifest.json
      if (manifestJSON.tab_bar) {
        manifestJSON = setRealUrlToManifest({
          urlPrefix: pagePrefix,
          urlSuffix: pageSuffix,
          cdnPrefix,
          isTemplate,
          inlineStyle,
          api,
        }, manifestJSON);

        compilation.assets['manifest.json'] = new RawSource(JSON.stringify(manifestJSON, null, 2));

        console.log(`  ${chalk.underline.white(`${cdnPrefix}manifest.json?pha=true`)}`);
      } else {
        const entries = getMpaEntries(api, {
          target: 'web',
          appJsonContent: appConfig,
        });
        const copyManifestJSON = Object.assign({}, manifestJSON);
        entries.filter(({ __frameIndex, __pageHeader }) => {
          if ((typeof __frameIndex !== 'undefined' && __frameIndex !== 0) || __pageHeader) {
            return false;
          }
          return true;
        }).forEach(({ source, entryName, __frameIndex }) => {
          manifestJSON.pages = copyManifestJSON.pages.filter((page) => {
            // has frames
            if (__frameIndex === 0) {
              return !!(page.frames && page.frames[0] && page.frames[0].source === source);
            } else {
              return page.source === source;
            }
          });

          manifestJSON = setRealUrlToManifest({
            urlPrefix: pagePrefix,
            urlSuffix: pageSuffix,
            cdnPrefix,
            isTemplate,
            inlineStyle,
            api,
          }, manifestJSON);
          compilation.assets[`${entryName}-manifest.json`] = new RawSource(JSON.stringify(manifestJSON, null, 2));

          console.log(`  ${chalk.underline.white(`${cdnPrefix}${entryName}-manifest.json?pha=true`)}`);
        });
      }

      console.log();
      callback();
    });
  }
};
