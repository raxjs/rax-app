const { dirname, sep } = require('path');

const AppLoader = require.resolve('jsx2mp-loader/src/app-loader');
const PageLoader = require.resolve('jsx2mp-loader/src/page-loader');

const platformConfig = require('./map/platformConfig');


function getEntry(entryAppFilePath, routes, options) {
  const rootDir = dirname(entryAppFilePath);
  const entry = {};
  const { platform, constantDir, mode, disableCopyNpm, turnOffSourceMap } = options;

  const pageLoaderParams = {
    platform: platformConfig[platform],
    entryPath: entryAppFilePath,
    constantDir,
    mode,
    disableCopyNpm,
    turnOffSourceMap
  };

  const appLoaderParams = JSON.stringify({ entryPath: rootDir, platform: platformConfig[platform], mode, disableCopyNpm, turnOffSourceMap });

  entry.app = `${AppLoader}?${appLoaderParams}!./${entryAppFilePath}`;

  if (Array.isArray(routes)) {
    routes.filter(({ targets }) => {
      return !Array.isArray(targets) || targets.indexOf('miniapp') > -1;
    }).forEach(({ source, window = {} }) => {
      entry[`page@${source}`] = `${PageLoader}?${JSON.stringify(Object.assign({ pageConfig: window }, pageLoaderParams))}!${getDepPath(source, rootDir)}`;
    });
  }
  return entry;
}

/**
 * ./pages/foo -> based on src, return original
 * /pages/foo -> based on rootContext
 * pages/foo -> based on src, add prefix: './' or '.\'
 */
function getDepPath(source, rootDir) {
  if (source[0] === '.' || source[0] === sep) {
    return join(rootDir, source);
  } else {
    return ['.', rootDir, source].join(sep);
  }
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

