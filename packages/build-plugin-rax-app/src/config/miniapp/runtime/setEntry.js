const { dirname, join, resolve, sep } = require('path');

const EntryLoader = require.resolve('../../../loaders/MiniAppEntryLoader');

/**
 *
 * @param {string} rootDir
 * @param {string} entryPath
 * @param {string} com
 */
function getDepPath(rootDir, entryPath, com) {
  const srcPath = dirname(entryPath);
  if (com[0] === sep ) {
    return join(rootDir, srcPath, com);
  } else {
    return resolve(rootDir, srcPath, com);
  }
};

module.exports = (config, rootDir, entryPath = './src/app', routes) => {
  config.entryPoints.clear();

  routes.forEach(({ entryName, source }) => {
    const entryConfig = config.entry(entryName);

    const pageEntry = getDepPath(rootDir, entryPath, source);
    entryConfig.add(`${EntryLoader}?${JSON.stringify({ routes })}!${pageEntry}`);
  });

  // Add app entry
  config.entry('app').add(getDepPath(rootDir, entryPath, 'app'));
};

