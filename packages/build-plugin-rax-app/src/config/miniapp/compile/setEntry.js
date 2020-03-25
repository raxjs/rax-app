const { dirname, join, sep } = require('path');

const AppLoader = require.resolve('jsx2mp-loader/src/app-loader');
const PageLoader = require.resolve('jsx2mp-loader/src/page-loader');

const appFlagLoader = require.resolve('jsx2mp-loader/src/appFlagLoader');
const pageFlagLoader = require.resolve('jsx2mp-loader/src/pageFlagLoader');

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


  entry.app = `${appFlagLoader}!./${entryAppFilePath}`;
  if (Array.isArray(routes)) {
    routes.forEach(({ source }) => {
      entry[`page@${source}`] = `${pageFlagLoader}!${getDepPath(source, rootDir)}`;
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

