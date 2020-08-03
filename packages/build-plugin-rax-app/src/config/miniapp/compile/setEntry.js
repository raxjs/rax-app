const { dirname, join, sep } = require('path');
const { absoluteModuleResolve } = require('../../pathHelper');

/**
 * ./pages/foo -> based on src, return original
 * /pages/foo -> based on rootContext
 * pages/foo -> based on src, add prefix: './' or '.\'
 */
function getDepPath(sourcePath, pageSource, rootDir) {
  if (pageSource[0] === '.' || pageSource[0] === sep) {
    return join(rootDir, sourcePath, pageSource);
  }
  return [rootDir, sourcePath, pageSource].join(sep);
}

function getEntry(entryAppFilePath, routes, rootDir) {
  const sourcePath = dirname(entryAppFilePath);
  const entry = {};

  entry.app = absoluteModuleResolve(rootDir, `./${entryAppFilePath}`) + '?role=app'; // Mark it as app file

  if (Array.isArray(routes)) {
    routes.forEach(({ source: pageSource }) => {
      entry[`page@${pageSource}`] = `${getDepPath(sourcePath, pageSource, rootDir)}?role=page`; // Mark it as page file
    });
  }
  return entry;
}

module.exports = (config, routes, options) => {
  config.entryPoints.clear();
  const { appEntry, rootDir, target } = options;
  const entries = getEntry(appEntry, routes, rootDir);
  for (const [entryName, source] of Object.entries(entries)) {
    const entryConfig = config.entry(entryName);
    entryConfig.add(source);
  }
};

