const { decamelize } = require('humps');
const pathPackage = require('path');

// appConfig keys need transform to manifest
const retainKeys = [
  'name',
  'startUrl',
  'shortName',
  'lang',
  'dir',
  'description',
  'backgroundColor',
  'display',
  'icons',
  'appWorker',
  'window',
  'pageHeader',
  'tabHeader',
  'tabBar',
  'pages',
  'dataPrefetches',
  'spm',
  'metas',
  'links',
  'scripts',
  'offlineResources',
  'manifestPrefetchExpires',
  'manifestPrefetchMaxAge',
  'queryParamsPassKeys',
  'queryParamsPassIgnoreKeys',
  'splashViewTimeout',
  'swiperThreshold',
];

// transform app config to decamelize
function transformAppConfig(appConfig, isRoot = true, parentKey) {
  const data = {};

  if (isRoot && appConfig.routes) {
    appConfig.pages = appConfig.routes;
  }
  for (let key in appConfig) {
    // filter not need key
    if (isRoot && retainKeys.indexOf(key) === -1) {
      continue;
    }
    const value = appConfig[key];

    // compatible tabHeader
    if (key === 'pageHeader') {
      key = 'tabHeader';
    }
    const transformKey = decamelize(key);
    if (key === 'window') {
      Object.assign(data, transformAppConfig(value, false));
    } else if (typeof value === 'string' || typeof value === 'number') {
      data[transformKey] = value;
    } else if (Array.isArray(value)) {
      data[transformKey] = value.map((item) => {
        if (typeof item === 'object') {
          if (key === 'dataPrefetches' && !item.header) {
            // hack: No header will crash in Android
            item.header = {};
          }
          return transformAppConfig(item, false, key);
        }
        return item;
      });
    } else if (typeof value === 'object' && !(parentKey === 'dataPrefetches' && (key === 'header' || key === 'data'))) {
      data[transformKey] = transformAppConfig(value, false, key);
    } else {
      data[transformKey] = value;
    }
  }
  return data;
}

/*
 * change page info
 */
function changePageInfo({ urlPrefix, urlSuffix = '', cdnPrefix, isTemplate, inlineStyle, api }, page, manifest) {
  const { applyMethod } = api;
  const { source, name } = page;
  if (!source && !name) {
    return page;
  }
  const { document, custom } = applyMethod('rax.getDocument', { name, source }) || {};
  let entryName;
  if (name) {
    entryName = name;
    page.key = name;
  } else if (source) {
    const dir = pathPackage.dirname(source);
    entryName = pathPackage.parse(dir).name.toLocaleLowerCase();
  }
  if (entryName) {
    if (!page.path || !page.path.startsWith('http')) {
      page.path = `${urlPrefix + entryName + urlSuffix}`;
    }

    if (isTemplate) {
      if (custom) {
        page.document = document;

        if (manifest.built_in_library) {
          // remove when has document
          delete manifest.built_in_library;
        }
      } else {
        // add script and stylesheet
        page.script = `${cdnPrefix + entryName}.js`;
        if (!inlineStyle) {
          page.stylesheet = `${cdnPrefix + entryName}.css`;
        }
      }
    }
  }

  delete page.source;
  return page;
}

/**
 * set real url to manifest
 */
function setRealUrlToManifest(options, manifest) {
  const { urlPrefix, cdnPrefix } = options;
  if (!urlPrefix) {
    return manifest;
  }

  if (manifest.app_worker && manifest.app_worker.url) {
    manifest.app_worker.url = cdnPrefix + manifest.app_worker.url;
  }

  if (manifest.pages && manifest.pages.length > 0) {
    manifest.pages = manifest.pages.map((page) => {
      // has frames
      if (page.frames && page.frames.length > 0) {
        page.frames = page.frames.map((frame) => {
          return changePageInfo(options, frame, manifest);
        });
      }

      return changePageInfo(options, page, manifest);
    });
  }

  return manifest;
}

module.exports = {
  transformAppConfig,
  setRealUrlToManifest,
};
