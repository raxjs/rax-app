const { dirname } = require('path');
const {
  pathHelper: { absoluteModuleResolve, getDepPath },
} = require('miniapp-builder-shared');

function getEntry(entryAppFilePath, routes, rootDir) {
  const sourcePath = dirname(entryAppFilePath);
  const entry = {};

  entry.app =
    absoluteModuleResolve(rootDir, `./${entryAppFilePath}`) + '?role=app'; // Mark it as app file

  if (Array.isArray(routes)) {
    routes.forEach(({ source: pageSource }) => {
      entry[`page@${pageSource}`] = `${getDepPath(
        rootDir,
        pageSource,
        sourcePath
      )}?role=page`; // Mark it as page file
    });
  }
  return entry;
}

module.exports = (config, routes, options) => {
  config.entryPoints.clear();
  const { entryPath, rootDir } = options;
  const entries = getEntry(entryPath, routes, rootDir);
  for (const [entryName, source] of Object.entries(entries)) {
    const entryConfig = config.entry(entryName);
    entryConfig.add(source);
  }
};
