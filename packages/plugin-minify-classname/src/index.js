const path = require('path');
const { minify } = require('minify-css-modules-classname');
const { normalizePath, readPkg, isTargetMiniApp } = require('./shared');

module.exports = function minifyCSSModulesClassnamePlugin({ onGetWebpackConfig, context }) {
  const { command, rootDir, userConfig = {} } = context;
  const { targets = ['web'] } = userConfig;

  if (command === 'build') {
    targets.forEach(target => {
      // -----
      // For miniapp projects:
      // 1. use alphabet to generate classnames, to gain a smaller css bundle size( official 2M limit )
      // 2. add default suffix `_mc`(short for `minify classname`) to avoid classname conflicts
      //    with 3rd-party css
      // -----
      // For other projects(like web):
      // 1. use hash to generate classnames because size is almost the same with gzip enabled
      // 2. no prefix or suffix is needed because hash is already unique
      const isMiniApp = isTargetMiniApp(target);
      const useHash = !isMiniApp;
      const suffix = isMiniApp ? '_mc' : '';

      onGetWebpackConfig(target, (config) => {
        configCSSModulesOptions(config, {
          getLocalIdent,
        });
      });

      // move getLocalIdent here to access `useHash` and `suffix`
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
    });
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
