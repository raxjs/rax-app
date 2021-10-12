const fs = require('fs-extra');
const path = require('path');
const { getAppConfig, filterNativePages, pathHelper: { getBundlePath } } = require('miniapp-builder-shared');
const getVirtualModules = require('./virtualModule/page');

module.exports = (config, context, target) => {
  const { rootDir, userConfig } = context;
  const { subPackages = false } = userConfig[target] || {};

  const appConfig = getAppConfig(rootDir, target);

  if (subPackages) {
    appConfig.routes.forEach((app) => {
      const subAppRoot = path.dirname(app.source);
      const subAppEntry = moduleResolve(formatPath(path.join(rootDir, 'src', subAppRoot, 'app')));
      const subAppEntryConfig = config.entry(getBundlePath(subAppRoot));
      subAppEntryConfig.add(subAppEntry);

      const subAppConfig = getAppConfig(rootDir, target, null, subAppRoot);
      const filteredRoutes = filterNativePages(subAppConfig.routes, [], { rootDir, target });
      const virtualModules = getVirtualModules(filteredRoutes, { rootDir });
      virtualModules.forEach((value, key) => {
        config.plugin(`webpack-virtual-modules-${key}`).use(value);
        const pageEntry = path.join(rootDir, 'src', key);
        config.entry(key).add(pageEntry);
      });
    });
  } else {
    const appEntry = moduleResolve(formatPath(path.join(rootDir, './src/app')));
    const entryConfig = config.entry(getBundlePath());
    entryConfig.add(appEntry);

    const virtualModules = getVirtualModules(appConfig.routes, { rootDir });
    virtualModules.forEach((value, key) => {
      config.plugin(`webpack-virtual-modules-${key}`).use(value);
      const pageEntry = path.join(rootDir, 'src', key);
      config.entry(key).add(pageEntry);
    });
  }
};

function moduleResolve(filePath) {
  const ext = ['.ts', '.js', '.tsx', '.jsx'].find((extension) => fs.existsSync(`${filePath}${extension}`));
  if (!ext) {
    throw new Error(`Cannot find target file ${filePath}.`);
  }
  return require.resolve(`${filePath}${ext}`);
}

function formatPath(pathStr) {
  return process.platform === 'win32' ? pathStr.split(path.sep).join('/') : pathStr;
}
