const path = require('path');
const {minify} = require('minify-css-modules-classname');

module.exports = function minifyCSSModulesClassname({onGetWebpackConfig, context}, options = {}) {
  const { command, rootDir } = context;
  const { useHash = true, prefix = '', suffix = '' } = options;

  if (command === 'build') {
    onGetWebpackConfig('web', config => {
      configCSSModulesOptions(config, {
        getLocalIdent
      });
    })
  }

  function getLocalIdent(loaderContext, _, localName, opts) {
    const filepath = path.relative(
      rootDir || '',
      loaderContext.resourcePath
    );

    return minify(
      filepath,
      localName,
      {useHash, prefix, suffix}
    );
  }
}

function configCSSModulesOptions(config, cssModulesOptions = {}) {
  [
    'scss-module',
    'css-module',
    'less-module',
  ].forEach(rule => {
    if (config.module.rules.get(rule)) {
      config.module
        .rule(rule)
        .use('css-loader')
        .tap((options = {}) => ({
          ...options,
          ...{
            modules: cssModulesOptions
          }
        }));
    }
  });
};