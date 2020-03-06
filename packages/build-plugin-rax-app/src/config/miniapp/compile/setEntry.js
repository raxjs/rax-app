const { dirname, join, sep } = require('path');

const AppLoader = require.resolve('jsx2mp-loader/src/app-loader');
const PageLoader = require.resolve('jsx2mp-loader/src/page-loader');

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

function getEntry(entryAppFilePath, routes, options) {
  const rootDir = dirname(entryAppFilePath);
  const entry = {};
  const { target, loaderParams } = options;

  const pageLoaderParams = {
    ...loaderParams,
    entryPath: entryAppFilePath,
  };

  const appLoaderParams = JSON.stringify({ ...loaderParams, entryPath: rootDir });

  entry.app = `${AppLoader}?${appLoaderParams}!./${entryAppFilePath}`;
  if (Array.isArray(routes)) {
    routes.filter(({ targets }) => {
      return !Array.isArray(targets) || targets.indexOf(target) > -1;
    }).forEach(({ source, window = {} }) => {
      entry[`page@${source}`] = `${PageLoader}?${JSON.stringify(Object.assign({ pageConfig: window }, pageLoaderParams))}!${getDepPath(source, rootDir)}`;
    });
  }
  return entry;
}

module.exports = (config, routes, options) => {
  config.entryPoints.clear();

  const appEntry = 'src/app.js';
  const entries = getEntry(appEntry, routes, options);
  for (const [entryName, source] of Object.entries(entries)) {
    const entryConfig = config.entry(entryName);
    entryConfig.add(source);
  }
};

