const { hmrClient } = require('rax-compile-config');
const setPublicPath = require('../setPublicPath');

module.exports = (config) => {
  const allEntries = config.entryPoints.entries();
  for (const entryName in allEntries) {
    if (Object.prototype.hasOwnProperty.call(allEntries, entryName)) {
      // remove hmrClient
      config.entry(entryName).delete(hmrClient);
    }
  }

  config.devServer.delete('before');

  setPublicPath(config);

  return config;
};
