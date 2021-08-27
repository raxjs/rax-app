import { decamelize } from 'humps';
import * as pathPackage from 'path';

/**
 * transform config key to decamelcase
 * @param appConfig app config
 * @param isRoot flag of root key
 * @param parentKey parent key
 * @returns config after decamelizing
 */
export const transformAppConfig = (appConfig: Record<string, any>, isRoot = true, parentKey?: string) => {
  const data: Record<string, any> = {};

  if (isRoot && appConfig.routes) {
    appConfig.pages = appConfig.routes;
  }

  // eslint-disable-next-line
  Object.entries(appConfig).forEach(([key, value]) => {
    if (isRoot && !retainKeys.includes(key)) {
      return;
    }

    if (key === 'pageHeader') {
      key = 'tabHeader';
    }

    let transformedKey = key;
    if (!camelizeKeys.includes(key)) {
      transformedKey = decamelize(key);
    }

    if (key === 'window') {
      extend(data, transformAppConfig(value, false));

      return;
    }

    // keys of requestHeaders should not be transformed
    if (isStr(value) || isNum(value) || key === 'requestHeaders') {
      extend(data, { [transformedKey]: value });

      return;
    }

    if (isArr(value)) {
      extend(data, {
        [transformedKey]: value.map((item) => {
          if (parentKey === 'tabBar' && item.text) {
            item.name = item.text;
            delete item.text;
          }

          if (isObj(item)) {
            if (key === 'dataPrefetch') {
              // hack: No header will crash in Android
              item.header = item.header ?? {};
            }

            return transformAppConfig(item, false, key);
          }

          return item;
        }),
      });

      return;
    }

    if (isObj(value) && !(parentKey === 'dataPrefetch' && ['header', 'data'].includes(key))) {
      extend(data, { [transformedKey]: transformAppConfig(value, false, key) });

      return;
    }

    extend(data, { [transformedKey]: value });
  });

  return data;
};

interface Options {
  urlPrefix?: string;
  urlSuffix?: string;
  cdnPrefix?: string;
  isTemplate?: boolean;
  inlineStyle?: false | { forceEnableCSS: boolean };
  api?: any;
}

/**
 * get real page info
 * @param options options
 * @param page page info
 * @returns page url & entry name
 */
const getRealPageInfo = ({ urlPrefix, urlSuffix = '' }: Options, page: Record<string, any>) => {
  const { source, name, query_params = '' } = page;

  let entryName: string;
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

  return {
    pageUrl,
    entryName,
  };
};

const changePageInfo = (
  { urlPrefix, urlSuffix = '', cdnPrefix, isTemplate, inlineStyle, api }: Options,
  page: Record<string, any>,
) => {
  const { applyMethod } = api;
  const { source, name } = page;

  if (!source && !name) {
    return page;
  }

  const { document, custom } = applyMethod('rax.getDocument', { name, source }) || {};
  const { entryName, pageUrl } = getRealPageInfo(
    {
      urlPrefix,
      urlSuffix,
      api,
    },
    page,
  );

  if (entryName) {
    if (!page.path || !page.path.startsWith('http')) {
      page.path = pageUrl;
    }

    if (isTemplate) {
      if (custom) {
        page.document = document;
        return page;
      }

      // add script and stylesheet
      page.script = `${cdnPrefix + entryName}.js`;

      if (!inlineStyle || inlineStyle.forceEnableCSS) {
        page.stylesheet = `${cdnPrefix + entryName}.css`;
      }
    }
  }

  return page;
};

/**
 * get tab header info
 * @param options options
 * @param page page info
 */
function changeTabHeaderInfo({ api }: Options, page: Record<string, any>) {
  const { applyMethod } = api;
  const { tab_header = {} } = page;
  const { source, url } = tab_header;

  if (source) {
    const { document, custom } = applyMethod('rax.getDocument', { source }) || {};

    // if config url, skip document
    if (!url && custom) {
      tab_header.html = document;
    }
  }

  delete page.tab_header.source;
}

function changeTabBarInfo({ api }: Options, tabBar: Record<string, any>) {
  const { applyMethod } = api;
  const { source, url } = tabBar;

  if (source) {
    const { document, custom } = applyMethod('rax.getDocument', { source }) || {};

    // if config url, skip document
    if (!url && custom) {
      tabBar.html = document;
    }
  }
}

export function setRealUrlToManifest(options, manifest) {
  const { urlPrefix, cdnPrefix } = options;
  if (!urlPrefix) {
    return manifest;
  }

  const { app_worker, tab_bar, pages } = manifest;
  if (app_worker && app_worker.url && !app_worker.url.startsWith('http')) {
    app_worker.url = cdnPrefix + app_worker.url;
  }

  if (tab_bar && tab_bar.source && !tab_bar.url) {
    tab_bar.url = getRealPageInfo(options, tab_bar).pageUrl;
    changeTabBarInfo(options, tab_bar);
  }

  if (pages && pages.length > 0) {
    manifest.pages = pages.map((page) => {
      // has frames
      if (page.frames && page.frames.length > 0) {
        page.frames = page.frames.map((frame) => {
          return changePageInfo(options, frame);
        });
      }

      if (page.tab_header && page.tab_header.source) {
        const { pageUrl } = getRealPageInfo(options, page.tab_header);
        page.tab_header.url = pageUrl;
        changeTabHeaderInfo(options, page);
      }
      return changePageInfo(options, page);
    });
  }

  return manifest;
}

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
  'packageResources',
  'manifestPrefetchExpires',
  'manifestPrefetchMaxAge',
  'maxAge',
  'expires',
  'queryParamsPassKeys',
  'queryParamsPassIgnoreKeys',
  'splashViewTimeout',
  'swiperThreshold',
  'requestHeaders',
  'enablePoplayer',
  'disableCapture',
  'enablePullRefresh',
  'pullRefreshBackgroundColor',
  'pullRefreshColorScheme',
  'pullRefresh',
];

// do not decamelize list
const camelizeKeys = [
  'appKey',
  'dataType',
  'valueType',
  'isSec',
  'LoginRequest',
  'sessionOption',
  'AntiCreep',
  'AntiFlood',
  'needLogin',
];

const { toString } = Object.prototype;

/**
 * getTag
 * @param value any value
 * @returns type tag
 */
const getTag = <T>(value: T) => {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]';
  }
  return toString.call(value);
};

/**
 * isStr
 * @param value any value
 * @returns is string
 */
const isStr = <T>(value: T) => getTag(value) === '[object String]';

/**
 * isStr
 * @param value any value
 * @returns is string
 */
const isNum = <T>(value: T) => getTag(value) === '[object Number]';

/**
 * isArr
 * @param value any value
 * @returns is array
 */
const isArr = <T>(value: T) => getTag(value) === '[object Array]';

/**
 * isObj
 * @param value any value
 * @returns is object
 */
const isObj = <T>(value: T) => getTag(value) === '[object Object]';

/**
 * copy the values of all of the enumerable own properties from one or more source objects to a target object.
 * @param target the target object to copy to.
 * @param source the source object from which to copy properties.
 * @returns the target object.
 */
const extend = (target: {}, source: unknown) => {
  return Object.assign(target, source);
};
