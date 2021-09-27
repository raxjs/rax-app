/**
 * app.json to manifest.json plugin
 */

const webpackSources = require('webpack-sources');
const webpack = require('webpack');
const cloneDeep = require('lodash.clonedeep');
const { getMpaEntries } = require('@builder/app-helpers');
const { emitAsset, processAssets } = require('@builder/compat-webpack4');
const { transformAppConfig, setRealUrlToManifest } = require('../manifestHelpers');
const { setPHADevUrls } = require('../phaDevUrls');

const PLUGIN_NAME = 'PHA_AppToManifestPlugin';

const { RawSource } = webpack.sources || webpackSources;

module.exports = class {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    const { api, builtInLibrary = [], appWorkerPath } = this.options;

    const { context, getValue } = api;
    const { command, userConfig = {} } = context;
    const { inlineStyle, web = {} } = userConfig;
    const {
      pha: { template: isTemplate = true },
    } = web;
    const isStart = command === 'start';

    let { cdnPrefix = '', pagePrefix = '', pageSuffix } = this.options;
    if (isStart) {
      cdnPrefix = `${getValue('devUrlPrefix')}/`;
      pagePrefix = cdnPrefix;
      pageSuffix = '.html';
    }

    processAssets({
      pluginName: PLUGIN_NAME,
      compiler,
    }, ({ compilation, callback }) => {
      const appConfig = getValue('staticConfig');
      let manifestJSON = transformAppConfig(appConfig);
      const devUrls = [];

      if (appWorkerPath) {
        manifestJSON.app_worker = manifestJSON.app_worker || {};

        if (!manifestJSON.app_worker.url) {
          manifestJSON.app_worker.url = 'pha-worker.js';
        }
      }

      manifestJSON.scripts = [
        ...builtInLibrary.map((url) => `<script crossorigin="anonymous" src="${url}"></script>`),
        ...(manifestJSON.scripts || []),
      ];

      // if has tabBar, do not generate multiple manifest.json
      if (manifestJSON.tab_bar) {
        manifestJSON = setRealUrlToManifest(
          {
            urlPrefix: pagePrefix,
            urlSuffix: pageSuffix,
            cdnPrefix,
            isTemplate,
            inlineStyle,
            api,
          },
          manifestJSON,
        );

        emitAsset(compilation, 'manifest.json', new RawSource(JSON.stringify(manifestJSON, null, 2)));

        devUrls.push(`${cdnPrefix}manifest.json?pha=true`);
      } else {
        const entries = getMpaEntries(api, {
          target: 'web',
          appJsonContent: appConfig,
        });
        entries
          .filter(({ __frameIndex, __pageHeader, __tabBar }) => {
            if ((typeof __frameIndex !== 'undefined' && __frameIndex !== 0) || __pageHeader || __tabBar) {
              return false;
            }
            return true;
          })
          .forEach(({ source, entryName, __frameIndex }) => {
            let copyManifestJSON = cloneDeep(manifestJSON);
            copyManifestJSON.pages = copyManifestJSON.pages.filter((page) => {
              // has frames
              if (__frameIndex === 0) {
                return !!(page.frames && page.frames[0] && page.frames[0].source === source);
              } else {
                return page.source === source;
              }
            });

            const { pages } = copyManifestJSON;
            // take out the page data prefetch and assign it to the root node
            if (pages && pages[0] && pages[0].data_prefetch) {
              copyManifestJSON.data_prefetch = pages[0].data_prefetch;
              delete pages[0].data_prefetch;
            }

            copyManifestJSON = setRealUrlToManifest(
              {
                urlPrefix: pagePrefix,
                urlSuffix: pageSuffix,
                cdnPrefix,
                isTemplate,
                inlineStyle,
                api,
              },
              copyManifestJSON,
            );

            emitAsset(compilation, `${entryName}-manifest.json`, new RawSource(JSON.stringify(copyManifestJSON, null, 2)))

            devUrls.push(`${cdnPrefix}${entryName}-manifest.json?pha=true`);
          });
      }

      if (isStart) {
        setPHADevUrls(devUrls);
      }

      callback();
    });
  }
};
