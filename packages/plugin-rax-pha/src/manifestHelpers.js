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
  'dataPrefetch',
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
          if (key === 'dataPrefetch' && !item.header) {
            // hack: No header will crash in Android
            item.header = {};
          }
          return transformAppConfig(item, false, key);
        }
        return item;
      });
    } else if (typeof value === 'object' && !(parentKey === 'dataPrefetch' && (key === 'header' || key === 'data'))) {
      data[transformKey] = transformAppConfig(value, false, key);
    } else {
      data[transformKey] = value;
    }
  }
  return data;
}

function getRealPageInfo({ urlPrefix, urlSuffix = '' }, page) {
  const { source, name } = page;
  let entryName;
  if (name) {
    entryName = name;
    page.key = name;
  } else if (source) {
    const dir = pathPackage.dirname(source);
    entryName = pathPackage.parse(dir).name.toLocaleLowerCase();
  }

  return {
    pageUrl: entryName ? `${urlPrefix + entryName + urlSuffix}` : '',
    entryName,
  };
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
  const { entryName, pageUrl } = getRealPageInfo({
    urlPrefix,
    urlSuffix,
  }, page);
  if (entryName) {
    if (!page.path || !page.path.startsWith('http')) {
      page.path = pageUrl;
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

  const { app_worker, tab_bar, pages } = manifest;
  if (app_worker && app_worker.url) {
    app_worker.url = cdnPrefix + app_worker.url;
  }

  if (tab_bar && tab_bar.source && !tab_bar.url) {
    tab_bar.url = getRealPageInfo(options, {
      source: tab_bar.source,
      name: tab_bar.name,
    }).pageUrl;
  }

  if (pages && pages.length > 0) {
    manifest.pages = pages.map((page) => {
      // has frames
      if (page.frames && page.frames.length > 0) {
        page.frames = page.frames.map((frame) => {
          return changePageInfo(options, frame, manifest);
        });
      }

      if (page.tab_header && page.tab_header.source) {
        page.tab_header.url = getRealPageInfo(options, {
          source: page.tab_header.source,
          name: page.tab_header.name,
        }).pageUrl;
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
