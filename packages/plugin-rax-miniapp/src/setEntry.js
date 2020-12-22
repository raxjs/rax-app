const fs = require('fs-extra');
const path = require('path');
const { getAppConfig } = require('miniapp-builder-shared');

module.exports = (config, context, target) => {
  const { rootDir, userConfig } = context;
  const { subPackages = false } = userConfig[target] || {};

  const appConfig = getAppConfig(rootDir, target);

  if (subPackages) {
    appConfig.routes.forEach((app) => {
      const subAppRoot = path.dirname(app.source);
      const subAppEntry = moduleResolve(formatPath(path.join(rootDir, 'src', subAppRoot, 'app')));
      const subAppEntryConfig = config.entry(subAppRoot);
      subAppEntryConfig.add(subAppEntry);
    });
  } else {
    // SPA
    const appEntry = moduleResolve(formatPath(path.join(rootDir, './src/app')));
    const entryConfig = config.entry('index');

    entryConfig.add(appEntry);
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
