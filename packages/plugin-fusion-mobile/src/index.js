const fs = require('fs-extra');
const chalk = require('chalk');
const setImport = require('./utils/setImport');
const removeCssVar = require('./utils/removeCssVar');
const getThemeFilePath = require('./utils/getThemeFilePath');

module.exports = (api, options = {}) => {
  const { onGetWebpackConfig, context, log, onHook } = api;
  const { rootDir } = context;
  const { transformCssVariables = false, extractModules = true, injectTheme = false, themePackage = '' } = options;

  // use babel-plugin-import to extract code
  if (extractModules !== false) {
    log.info('[plugin-fusion-mobile]: extracting code for modules: @alifd/meet, @alifd/meet-react');
    onGetWebpackConfig((config) => {
      setImport(config);
    });
  }

  // try to remove all css-vars to reduce css bundle size
  if (transformCssVariables !== false) {
    onHook('after.build.compile', (multiStats) => {
      let stats = [];

      if (multiStats && multiStats.stats && multiStats.stats.stats) {
        stats = multiStats.stats.stats;
      }

      stats.forEach((stat) => {
        const { compilation } = stat;
        const { assets } = compilation;
        const bundleCSSFileNames = Object.keys(assets).filter((filename) => /bundle.css\.[a-z]{2}ss$/.test(filename));
        const themeFilePath = injectTheme ? getThemeFilePath(rootDir, themePackage) : '';

        if (bundleCSSFileNames && bundleCSSFileNames.length > 0) {
          const filePath = assets[bundleCSSFileNames[0]].existsAt;
          const originalFileStats = fs.statSync(filePath);

          if (fs.existsSync(filePath)) {
            removeCssVar(filePath, themeFilePath, () => {
              const newFileStats = fs.statSync(filePath);

              log.info(
                `[build-plugin-fusion-mobile] tranformed css variables successfully at: ${chalk.underline(
                  filePath,
                )} (${Math.floor(originalFileStats.size / 1024)}kb → ${Math.floor(newFileStats.size / 1024)}kb)`,
              );
            });
          }
        }
      });
    });
  }
};
