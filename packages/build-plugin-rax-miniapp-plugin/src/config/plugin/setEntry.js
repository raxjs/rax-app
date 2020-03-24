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

function getEntry(entryIndexFilePath, pluginConfig) {
  const { pages, publicComponents, main } = pluginConfig;
  const rootDir = dirname(entryIndexFilePath);
  const entry = {};

  if (Array.isArray(pages)) {
    pages.forEach(page => {
      entry[`@${page}`] = `${getDepPath(page, rootDir)}?role=page`;
    });
  }
  if (publicComponents) {
    Object.keys(publicComponents).forEach(compName => {
      entry[`@${compName}`] = `${getDepPath(publicComponents[compName], rootDir)}?role=component`;
    });
  }
  if (main) {
    entry.main = getDepPath(main, rootDir);
  }
  return entry;
}

module.exports = (config, pluginConfig, options) => {
  config.entryPoints.clear();
  const { entry } = options;
  const entries = getEntry(entry, pluginConfig);
  for (const [entryName, source] of Object.entries(entries)) {
    const entryConfig = config.entry(entryName);
    entryConfig.add(source);
  }
};

