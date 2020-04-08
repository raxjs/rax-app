const { dirname, join, sep, extname } = require('path');

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

/**
 * Remove file extension
 * @param {string} filePath
 */
function removeExt(filePath) {
  const lastDot = filePath.lastIndexOf('.');
  return filePath.slice(0, lastDot);
}

function getEntry(entryIndexFilePath, pluginConfig) {
  const { pages, publicComponents, main } = pluginConfig;
  const rootDir = dirname(entryIndexFilePath);
  const entry = {};

  if (pages) {
    Object.keys(pages).forEach(pageName => {
      entry[`@${pageName}`] = `${getDepPath(pages[pageName], rootDir)}?role=page`;
    });
  }
  if (publicComponents) {
    Object.keys(publicComponents).forEach(compName => {
      entry[`@${compName}`] = `${getDepPath(publicComponents[compName], rootDir)}?role=component`;
    });
  }
  if (main) {
    entry.main = removeExt(getDepPath(main, rootDir));
  }
  return entry;
}

module.exports = (config, pluginConfig, options) => {
  config.entryPoints.clear();
  const { entryPath } = options;
  const entries = getEntry(entryPath, pluginConfig);
  for (const [entryName, source] of Object.entries(entries)) {
    const entryConfig = config.entry(entryName);
    entryConfig.add(source);
  }
};

