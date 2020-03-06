const { sep } = require('path');
const adaptAppConfig = require('./adaptConfig');
const moduleResolve = require('./moduleResolve');

/**
 * Use '/' as path sep regardless of OS when outputting the path to code
 * @param {string} filepath
 */
function normalizeOutputFilePath(filepath) {
  return filepath.replace(/\\/g, '/');
}

function getRelativePath(filePath) {
  let relativePath;
  if (filePath[0] === sep) {
    relativePath = `.${filePath}`;
  } else if (filePath[0] === '.') {
    relativePath = filePath;
  } else {
    relativePath = `.${sep}${filePath}`;
  }
  return relativePath;
}

module.exports = function transformAppConfig(entryPath, originalConfig, target) {
  const config = {};
  for (let key in originalConfig) {
    const value = originalConfig[key];

    switch (key) {
      case 'routes':
        const pages = [];
        if (Array.isArray(value)) {
          // Only resolve first level of routes.
          value.forEach(({ source, targets }) => {
            if (!Array.isArray(targets)) {
              pages.push(normalizeOutputFilePath(moduleResolve(entryPath, getRelativePath(source))));
            }
            if (Array.isArray(targets) && targets.indexOf(target) > -1) {
              pages.push(normalizeOutputFilePath(moduleResolve(entryPath, getRelativePath(source))));
            }
          });
        }
        config.pages = pages;
        break;
      case 'window':
        adaptAppConfig(value, 'window', target);
        config[key] = value;
        break;
      case 'tabBar':
        if (value.items) {
          adaptAppConfig(value, 'items', target, originalConfig);
        }
        adaptAppConfig(value, 'tabBar', target);
        config[key] = value;
        break;
      default:
        config[key] = value;
        break;
    }
  }

  return config;
};
