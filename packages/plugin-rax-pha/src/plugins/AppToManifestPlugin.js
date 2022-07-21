/**
 * app.json to manifest.json plugin
 */

const webpackSources = require('webpack-sources');
const webpack = require('webpack');
const { cloneDeep, union } = require('@builder/pack/deps/lodash');
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

    const { context, getValue, applyMethod } = api;
    const { command, userConfig = {} } = context;
    const { inlineStyle, web = {} } = userConfig;
    const {
      pha: { template: isTemplate = true },
    } = web;
    const isStart = command === 'start';
    const jsonSpace = isStart ? 2 : 0;

    let { cdnPrefix = '', pagePrefix = '', pageSuffix } = this.options;
    if (isStart) {
      cdnPrefix = `${getValue('devUrlPrefix')}/`;
      pagePrefix = cdnPrefix;
      pageSuffix = '.html';
    }

    processAssets({
      pluginName: PLUGIN_NAME,
      compiler,
    }, ({ compilation, callback, assets }) => {
      const assetNames = Object.keys(assets);
      const appConfig = getValue('staticConfig');

      const { scripts, metas, links } = applyMethod('rax.getInjectedHTML');
      let manifestJSON = transformAppConfig(appConfig);
      const devUrls = [];

      if (appWorkerPath) {
        manifestJSON.app_worker = manifestJSON.app_worker || {};

        if (!manifestJSON.app_worker.url) {
          manifestJSON.app_worker.url = 'pha-worker.js';
        }
      }

      manifestJSON.metas = union(
        metas,
        manifestJSON.metas,
      ) || [];

      manifestJSON.links = union(
        links,
        manifestJSON.links,
      ) || [];

      manifestJSON.scripts = union(
        scripts,
        builtInLibrary.map((url) => `<script crossorigin="anonymous" src="${url}"></script>`),
        manifestJSON.scripts,
      ) || [];

      if (manifestJSON.tab_bar) {
        // Try save html string of custom tabbar to html of tab_bar.
        const { document } = applyMethod('rax.getDocument', { name: 'customtabbar' }) || {};
        if (document && !manifestJSON.html) {
          manifestJSON.tab_bar.html = document;
        }

        // If has tabBar, do not generate multiple manifest.json
        manifestJSON = setRealUrlToManifest(
          {
            urlPrefix: pagePrefix,
            urlSuffix: pageSuffix,
            cdnPrefix,
            isTemplate,
            inlineStyle,
            api,
            assetNames,
          },
          manifestJSON,
        );

        emitAsset(compilation, 'manifest.json', new RawSource(JSON.stringify(manifestJSON, null, jsonSpace)));

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
                assetNames,
              },
              copyManifestJSON,
            );

            emitAsset(compilation, `${entryName}-manifest.json`, new RawSource(JSON.stringify(copyManifestJSON, null, jsonSpace)));

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
