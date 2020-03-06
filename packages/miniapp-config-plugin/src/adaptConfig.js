const { MINIAPP, WECHAT_MINIPROGRAM } = require('./constants');

const appConfigMap = {
  window: {
    title: {
      [MINIAPP]: 'defaultTitle',
      [WECHAT_MINIPROGRAM]: 'navigationBarTitleText'
    },
    pullRefresh: {
      [MINIAPP]: 'pullRefresh',
      [WECHAT_MINIPROGRAM]: 'enablePullDownRefresh'
    },
    titleBarColor: {
      [MINIAPP]: 'titleBarColor',
      [WECHAT_MINIPROGRAM]: 'navigationBarBackgroundColor'
    }
  },
  tabBar: {
    textColor: {
      [MINIAPP]: 'textColor',
      [WECHAT_MINIPROGRAM]: 'color'
    },
    items: {
      [MINIAPP]: 'items',
      [WECHAT_MINIPROGRAM]: 'list'
    }
  },
  items: {
    name: {
      [MINIAPP]: 'name',
      [WECHAT_MINIPROGRAM]: 'text'
    },
    icon: {
      [MINIAPP]: 'icon',
      [WECHAT_MINIPROGRAM]: 'iconPath'
    },
    activeIcon: {
      [MINIAPP]: 'activeIcon',
      [WECHAT_MINIPROGRAM]: 'selectedIconPath'
    },
    path: {
      [MINIAPP]: 'pagePath',
      [WECHAT_MINIPROGRAM]: 'pagePath'
    }
  }
};

const adaptValueMap = {
  window: {
    pullRefresh: {
      [MINIAPP]: [
        [true, 'YES'],
        [false, 'NO']
      ]
    }
  }
};

function adaptConfig(config, property, platform, originalConfig = {}) {
  if (property === 'items') {
    config[property].forEach(item => {
      Object.keys(item).forEach(itemConfig => {
        if (appConfigMap.items[itemConfig] && appConfigMap.items[itemConfig][platform] !== itemConfig) {
          item[appConfigMap.items[itemConfig][platform]] = itemConfig === 'path' ? getSourceFromPath(item[itemConfig], originalConfig.routes) : item[itemConfig];
          delete item[itemConfig];
        }
      });
    });
    if (appConfigMap.tabBar.items[platform] !== property) {
      config[appConfigMap.tabBar.items[platform]] = config[property];
      delete config[property];
    }
  } else if (property === 'window') {
    Object.keys(config).forEach(c => {
      if (appConfigMap[property][c]) {
        if (adaptValueMap[property][c] && adaptValueMap[property][c][platform]) {
          config[c] = getAdaptValue(config[c], adaptValueMap[property][c][platform]);
        }
        if (appConfigMap[property][c][platform] !== c) {
          config[appConfigMap[property][c][platform]] = config[c];
          delete config[c];
        }
      }
    });
  }
}

function getAdaptValue(value, valueMapArr) {
  for (let valuePair of valueMapArr) {
    if (value === valuePair[0]) {
      return valuePair[1];
    }
  }
  return value;
}

/**
 * Get corresponding source from path
 *
 * @param {string} path
 * @param {Array<Object>} routes
 */
function getSourceFromPath(path, routes) {
  for (let route of routes) {
    if (route.path === path) {
      return route.source;
    }
  }
  return null;
}

module.exports = adaptConfig;
