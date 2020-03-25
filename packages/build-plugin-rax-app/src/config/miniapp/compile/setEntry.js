const { dirname, join, sep } = require('path');

/**
 * ./pages/foo -> based on src, return original
 * /pages/foo -> based on rootContext
 * pages/foo -> based on src, add prefix: './' or '.\'
 */
function getDepPath(source, rootDir) {
  if (source[0] === '.' || source[0] === sep) {
    return join(rootDir, source);
  }
  return ['.', rootDir, source].join(sep);
}

function getEntry(entryAppFilePath, routes) {
  const rootDir = dirname(entryAppFilePath);
  const entry = {};


  entry.app = `./${entryAppFilePath}?role=app`; // Mark it as app file
  if (Array.isArray(routes)) {
    routes.forEach(({ source }) => {
      entry[`page@${source}`] = `${getDepPath(source, rootDir)}?role=page`; // Mark it as page file
    });
  }
  return entry;
}

module.exports = (config, routes, options) => {
  config.entryPoints.clear();
  const { appEntry } = options;
  const entries = getEntry(appEntry, routes);
  for (const [entryName, source] of Object.entries(entries)) {
    const entryConfig = config.entry(entryName);
    entryConfig.add(source);
  }
};

