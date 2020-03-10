const { resolve } = require('path');
const { copy } = require('fs-extra');
const adaptAppConfig = require('./adaptConfig');
const handleIcon = require('./handleIcon');

module.exports = function transformAppConfig(outputPath, originalAppConfig, target) {
  const appConfig = {};
  for (let configKey in originalAppConfig) {
    const config = originalAppConfig[configKey];
    switch (configKey) {
      case 'routes':
        // filter routes
        break;
      case 'window':
        appConfig[configKey] = adaptAppConfig(config, 'window', target);
        break;
      case 'tabBar':
        // Handle tab item
        if (config.items) {
          config.items = config.items.map(itemConfig => {
            if (itemConfig.icon) {
              itemConfig.icon = handleIcon(itemConfig.icon, outputPath);
            }
            if (itemConfig.activeIcon) {
              itemConfig.activeIcon = handleIcon(itemConfig.activeIcon, outputPath);
            }
            return adaptAppConfig(itemConfig, 'items', target);
          });
        }
        // Handle custom tabBar
        if (config.custom && typeof config.custom === 'string') {
          // Custom tab bar should be native component
          copy(resolve('src', config.custom), resolve(outputPath, 'custom-tab-bar'));
          config.custom = true;
        }
        appConfig[configKey] = adaptAppConfig(config, 'tabBar', target);
        break;
      default:
        appConfig[configKey] = config;
        break;
    }
  }

  return appConfig;
};
