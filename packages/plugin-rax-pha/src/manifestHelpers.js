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
  'tabHeader',
  'tabBar',
  'pages',
  'dataPrefetches',
];

// transform app config to decamelize
function transformAppConfig(appConfig, isRoot = true) {
  const data = {};

  if (isRoot && appConfig.routes) {
    appConfig.pages = appConfig.routes;
  }
  for (const key in appConfig) {
    // filter not need key
    if (isRoot && retainKeys.indexOf(key) === -1) {
      continue;
    }
    const transformKey = decamelize(key);
    const value = appConfig[key];
    if (key === 'window') {
      Object.assign(data, transformAppConfig(value, false));
    } else if (typeof value === 'string' || typeof value === 'number') {
      data[transformKey] = value;
    } else if (Array.isArray(value)) {
      data[transformKey] = value.map((item) => {
        return transformAppConfig(item, false);
      });
    } else if (typeof value === 'object') {
      data[transformKey] = transformAppConfig(value, false);
    } else {
      data[transformKey] = value;
    }
  }

  return data;
}

// get every page manifest
function getPageManifestByPath(options) {
  const { path = '/', decamelizeAppConfig = {} } = options;
  let manifestData = {};
  const { pages = [] } = decamelizeAppConfig;
  const page = pages.find((item) => {
    return item.path === path;
  });

  if (!page) {
    return manifestData;
  }

  manifestData = {
    ...decamelizeAppConfig,
    ...page,
  };

  // if current page is not frame page
  // delete tabbar/tabHeader/pages
  if (!page.frame) {
    delete manifestData.tab_bar;
    delete manifestData.tab_header;
    delete manifestData.pages;
  }
  delete manifestData.source;

  return manifestData;
}

function changePageUrl(urlPrefix, page) {
  if (page.path && page.path.startsWith('http')) {
    return page;
  }
  const { source, name } = page;
  let entryName;
  if (name) {
    entryName = name;
  } else if (source) {
    const dir = pathPackage.dirname(source);
    entryName = pathPackage.parse(dir).name.toLocaleLowerCase();
  }

  if (entryName && entryName.length > 0) {
    page.path = `${urlPrefix + entryName}.html`;
  }

  delete page.source;
  return page;
}

function setRealUrlToManifest(urlPrefix, manifest) {
  if (!urlPrefix) {
    return manifest;
  }

  if (manifest.app_worker && manifest.app_worker.url) {
    manifest.app_worker.url = urlPrefix + manifest.app_worker.url;
  }

  if (manifest.pages && manifest.pages.length > 0) {
    manifest.pages = manifest.pages.map((page) => {
      // has frames
      if (page.frames && page.frames.length > 0) {
        page.frames = page.frames.map((frame) => {
          return changePageUrl(urlPrefix, frame);
        });
      }

      return changePageUrl(urlPrefix, page);
    });
  }

  return manifest;
}

module.exports = {
  transformAppConfig,
  getPageManifestByPath,
  setRealUrlToManifest,
};
