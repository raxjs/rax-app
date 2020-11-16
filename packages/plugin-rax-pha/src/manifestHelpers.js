const { decamelize } = require('humps');

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
  const { nsr, path = '/', decamelizeAppConfig = {}, publicPath = '/' } = options;
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

  // inject nsr_script
  if (nsr) {
    manifestData.nsr_script = `${publicPath}web${path === '/' ? '' : path}/index.nsr.js`;
  }
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

module.exports = {
  transformAppConfig,
  getPageManifestByPath,
};
