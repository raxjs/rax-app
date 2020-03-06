const { join, resolve } = require('path');
const { readJSONSync } = require('fs-extra');
const { getRouteName } = require('rax-compile-config');

const {
  moduleResolve,
  normalizeOutputFilePath,
  getRelativePath
} = require('./pathHelper');

module.exports = (context, target) => {
  const { rootDir } = context;
  const entryPath = join(rootDir, 'src');

  const appConfig = readJSONSync(resolve(rootDir, 'src', 'app.json'));
  appConfig.pages = [];
  const routes = [];

  if (!Array.isArray(appConfig.routes)) {
    throw new Error('routes in app.json must be array');
  }

  appConfig.routes.map((route, index) => {
    route.name = route.source;
    route.entryName = getRouteName(route, rootDir);

    if (!Array.isArray(route.targets)) {
      appConfig.pages.push(
        normalizeOutputFilePath(
          moduleResolve(entryPath, getRelativePath(route.source))
        )
      );
      routes.push(route);
    }
    if (Array.isArray(route.targets) && route.targets.indexOf(target) > -1) {
      appConfig.pages.push(
        normalizeOutputFilePath(
          moduleResolve(entryPath, getRelativePath(route.source))
        )
      );
      routes.push(route);
    }
  });

  appConfig.routes = routes;

  return appConfig;
};
