const { join, resolve, dirname } = require('path');
const { readJSONSync } = require('fs-extra');
const { getRouteName } = require('rax-compile-config');

const {
  moduleResolve,
  normalizeOutputFilePath,
  getRelativePath,
  removeExt
} = require('./pathHelper');

module.exports = (rootDir, entryPath = './src/app', target, nativeLifeCycleMap) => {
  const srcPath = join(rootDir, dirname(entryPath));

  const appConfig = readJSONSync(resolve(rootDir, `${removeExt(entryPath)}.json`));
  appConfig.pages = [];
  const routes = [];
  const pagesMap = {};

  if (!Array.isArray(appConfig.routes)) {
    throw new Error('routes in app.json must be array');
  }

  function addPage(route) {
    const page = normalizeOutputFilePath(
      moduleResolve(srcPath, getRelativePath(route.source))
    );
    appConfig.pages.push(page);
    routes.push(route);
    pagesMap[route.path] = page;
    if (nativeLifeCycleMap) {
      nativeLifeCycleMap[resolve(srcPath, route.source)] = {};
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
