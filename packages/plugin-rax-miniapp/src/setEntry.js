const fs = require('fs-extra');
const path = require('path');
const { pathHelper: { getBundlePath } } = require('miniapp-builder-shared');

module.exports = (config, { context, target, routes }) => {
  const { rootDir, userConfig } = context;
  const { subPackages = false } = userConfig[target] || {};

  if (subPackages) {
    routes.forEach(({ source }) => {
      const subAppRoot = path.dirname(source);
      const subAppEntryConfig = config.entry(getBundlePath(subAppRoot));
      subAppEntryConfig.add(path.join(rootDir, 'src', source));
    });
  } else {
    // SPA
    const appEntry = moduleResolve(formatPath(path.join(rootDir, './src/app')));
    const entryConfig = config.entry(getBundlePath());

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
