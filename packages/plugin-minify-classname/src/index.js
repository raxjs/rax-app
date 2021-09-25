const path = require('path');
const readPkgUp = require('read-pkg-up');
const { minify } = require('minify-css-modules-classname');

module.exports = function minifyCSSModulesClassname({ onGetWebpackConfig, context }, options = {}) {
  const { command, rootDir } = context;
  const { useHash = true, prefix = '', suffix = '' } = options;

  if (command === 'build') {
    onGetWebpackConfig('web', (config) => {
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
      { useHash, prefix, suffix }
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
