const BuildManifestPlugin = require('./BuildManifestPlugin');

module.exports = (config, routes, options) => {
  config.plugin('BuildManifestPlugin').use(BuildManifestPlugin, [{
    pages: routes,
    destPath: options.buildManifestPath
  }]);

  return config;
};
