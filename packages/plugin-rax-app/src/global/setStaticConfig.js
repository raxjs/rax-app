const path = require('path');
const fs = require('fs-extra');
const { formatPath } = require('@builder/app-helpers');
const { STATIC_CONFIG, TAB_BAR_PATH } = require('../constants');

module.exports = (api) => {
  const { setValue, getValue, context, applyMethod } = api;
  const { rootDir, userConfig } = context;
  let staticConfig;
  try {
    staticConfig = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/app.json')));
  } catch (err) {
    throw new Error('There need app.json in root dir.');
  }

  if (staticConfig.tabBar) {
    let tabBarPath;
    if (staticConfig.tabBar.custom) {
      tabBarPath = path.join(rootDir, 'src/components/CustomTabBar/index');
      if (!checkComponentFileExists(tabBarPath)) {
        tabBarPath = path.join(rootDir, 'src/CustomTabBar/index');
        if (!checkComponentFileExists(tabBarPath)) {
          throw new Error('There need custom tab bar implement in src/components/CustomTabBar/index.jsx');
        }
      }
      if (!Array.isArray(staticConfig.tabBar.list)) {
        throw new Error('There should have list field as array type to know which page need show tab bar');
      }
      staticConfig.tabBar.source = tabBarPath.replace(`${rootDir}/src`, '');
    } else {
      tabBarPath = path.join(getValue('TEMP_PATH'), 'plugins/app/TabBar');
    }

    tabBarPath = formatPath(tabBarPath);

    setValue(TAB_BAR_PATH, tabBarPath);

    if (!userConfig.mpa) {
      applyMethod('modifyRenderData', (renderData) => {
        return {
          ...renderData,
          tabBarPath,
        };
      });
    }
  }
  setValue(STATIC_CONFIG, staticConfig);
};

function checkComponentFileExists(filepath) {
  return ['jsx', 'js', 'tsx'].some((ext) => fs.existsSync(`${filepath}.${ext}`));
}
