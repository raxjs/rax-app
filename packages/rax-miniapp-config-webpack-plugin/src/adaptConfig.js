const { MINIAPP, WECHAT_MINIPROGRAM } = require('./constants');

const configKeyMap = {
  [MINIAPP]: {
    window: {
      title: 'defaultTitle',
      pullRefresh: 'pullRefresh',
      titleBarColor: 'titleBarColor'
    },
    tabBar: {
      textColor: 'textColor',
      items: 'items'
    },
    items: {
      name: 'name',
      icon: 'icon',
      activeIcon: 'activeIcon',
      path: 'pagePath'
    }
  },
  [WECHAT_MINIPROGRAM]: {
    window: {
      title: 'navigationBarTitleText',
      pullRefresh: 'enablePullDownRefresh',
      titleBarColor: 'navigationBarBackgroundColor'
    },
    tabBar: {
      textColor: 'color',
      items: 'list'
    },
    items: {
      name: 'text',
      icon: 'iconPath',
      activeIcon: 'selectedIconPath',
      path: 'pagePath'
    }
  }
};

const configValueMap = {
  [MINIAPP]: {
    window: {
      pullRefresh: {
        true: 'YES',
        false: 'NO'
      }
    }
  }
};

module.exports = function adaptConfig(originalConfig, property, target) {
  const config = {};
  const configKeyAdapter =
    configKeyMap[target] && configKeyMap[target][property];
  const configValueAdapter =
    configValueMap[target] && configValueMap[target][property];
  Object.keys(originalConfig).forEach(configKey => {
    // configKey, like title
    let key = configKey;
    let value = originalConfig[configKey];
    if (
      configKeyAdapter &&
      configKeyAdapter[configKey] &&
      configKey !== configKeyAdapter[configKey]
    ) {
      key = configKeyAdapter[configKey];
    }
    if (configValueAdapter && configValueAdapter[configKey]) {
      value = configValueAdapter[configKey][value];
    }
    config[key] = value;
  });

  return config;
};
