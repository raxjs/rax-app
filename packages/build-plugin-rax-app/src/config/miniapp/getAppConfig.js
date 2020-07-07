const { join, resolve } = require('path');
const { readJSONSync } = require('fs-extra');
const { getRouteName } = require('rax-compile-config');

const {
  relativeModuleResolve,
  normalizeOutputFilePath,
  getRelativePath
} = require('../pathHelper');

module.exports = (rootDir, target, nativeLifeCycleMap) => {
  const entryPath = join(rootDir, 'src');

  const appConfig = readJSONSync(resolve(rootDir, 'src', 'app.json'));
  appConfig.pages = [];
  const routes = [];
  const pagesMap = {};

  if (!Array.isArray(appConfig.routes)) {
    throw new Error('routes in app.json must be array');
  }

  function addPage(route) {
    const page = normalizeOutputFilePath(
      relativeModuleResolve(entryPath, getRelativePath(route.source))
    );
    appConfig.pages.push(page);
    routes.push(route);
    pagesMap[route.path] = page;
    if (nativeLifeCycleMap) {
      nativeLifeCycleMap[resolve(entryPath, route.source)] = {};
    }
  }

  appConfig.routes.map(route => {
    route.name = route.source;
    route.entryName = getRouteName(route, rootDir);

    if (!Array.isArray(route.targets)) {
      addPage(route);
    }
    if (Array.isArray(route.targets) && route.targets.indexOf(target) > -1) {
      addPage(route);
    }
  });

  if (appConfig.tabBar) {
    appConfig.tabBar.items.map(tab => {
      tab.path = pagesMap[tab.path];
    });
  }

  appConfig.routes = routes;

  return appConfig;
};
