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
  'requestHeaders',
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
        if (parentKey === 'tabBar' && item.text) {
          item.name = item.text;
          delete item.text;
        }
        if (typeof item === 'object') {
          if (key === 'dataPrefetch' && !item.header) {
            // hack: No header will crash in Android
            item.header = {};
          }
          return transformAppConfig(item, false, key);
        }
        return item;
      });
    } else if (key === 'requestHeaders') { // keys of requestHeaders should not be transformed
      data[transformKey] = value;
    } else if (typeof value === 'object' && !(parentKey === 'dataPrefetch' && (key === 'header' || key === 'data'))) {
      data[transformKey] = transformAppConfig(value, false, key);
    } else {
      data[transformKey] = value;
    }
  }
  return data;
}

function getRealPageInfo({ urlPrefix, urlSuffix = '' }, page) {
  const { source, name, query_params = '' } = page;
  let entryName;
  if (name) {
    entryName = name;
    page.key = name;
  } else if (source) {
    const dir = pathPackage.dirname(source);
    entryName = pathPackage.parse(dir).name.toLocaleLowerCase();
  }
  let pageUrl = '';
  if (entryName) {
    pageUrl = `${urlPrefix + entryName + urlSuffix}`;
  }

  if (pageUrl && query_params) {
    pageUrl = `${pageUrl}?${query_params}`;
  }

  delete page.source;
  return {
    pageUrl,
    entryName,
  };
}

/*
 * change page info
 */
function changePageInfo({ urlPrefix, urlSuffix = '', cdnPrefix, isTemplate, inlineStyle, api }, page) {
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
      } else {
        // add script and stylesheet
        page.script = `${cdnPrefix + entryName}.js`;
        if (!inlineStyle) {
          page.stylesheet = `${cdnPrefix + entryName}.css`;
        }
      }
    }
  }

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
    tab_bar.url = getRealPageInfo(options, tab_bar).pageUrl;
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
        page.tab_header.url = getRealPageInfo(options, page.tab_header).pageUrl;
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
