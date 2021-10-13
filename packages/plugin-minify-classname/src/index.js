const path = require('path');
const readPkgUp = require('read-pkg-up');
const { minify } = require('minify-css-modules-classname');

module.exports = function minifyCSSModulesClassnamePlugin({ onGetWebpackConfig, context }, pluginOptions = {}) {
  const { command, rootDir, userConfig = {} } = context;
  const { experiments = {} } = userConfig;
  const { miniapp = false } = pluginOptions;
  const enable = Boolean(experiments.minifyCSSModules);

  // -----
  // For miniapp projects:
  // 1. use alphabet to generate classnames, to gain a smaller css bundle size( official 2M limit )
  // 2. add default suffix `_mc`(short for `minify classname`) to avoid classname conflicts
  //    with 3rd-party css
  // -----
  // For other projects(like web):
  // 1. use hash to generate classnames because size is almost the same with gzip enabled
  // 2. no prefix or suffix is needed because hash is already unique
  const useHash = !miniapp;
  const suffix = miniapp ? '_mc' : '';

  if ((command === 'build') && enable) {
    onGetWebpackConfig((config) => {
      configCSSModulesOptions(config, {
        getLocalIdent,
      });
    });
  }

  // cache readPkgUp result
  const cache = new Map();
  function readPkg(filepath) {
    let cached = cache.get(filepath);

    if (!cached) {
      cached = readPkgUp.sync({ cwd: path.dirname(filepath) });
      cache.set(filepath, cached);
    }

    return cached;
  }

  function normalizePath(file) {
    return path.sep === '\\' ? file.replace(/\\/g, '/') : file;
  }

  function getLocalIdent(loaderContext, _, localName) {
    const { resourcePath } = loaderContext;
    const pkg = readPkg(resourcePath);
    const pkgName = (pkg && pkg.packageJson && pkg.packageJson.name) || '';
    const filepath = normalizePath(path.relative(rootDir || '', resourcePath));
    // locate file using pkgname + filepath
    const location = `${pkgName}#${filepath}`;

    return minify(
      location,
      localName,
      // eslint-disable-next-line comma-dangle
      { useHash, prefix: '', suffix }
    );
  }
};

function configCSSModulesOptions(config, cssModulesOptions = {}) {
  [
    'scss-module',
    'css-module',
    'less-module',
  ].forEach((rule) => {
    if (config.module.rules.get(rule)) {
      config.module
        .rule(rule)
        .use('css-loader')
        .tap((options = {}) => ({
          ...options,
          ...{
            modules: cssModulesOptions,
          },
        }));
    }
  });
}
