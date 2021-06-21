const setImport = require('./utils/set-import');
const removeCssVar = require('./utils/remove-css-var');
const fs = require('fs-extra');
const chalk = require('chalk');

module.exports = (api, options = {}) => {
  const { onGetWebpackConfig, onHook } = api;
  const { transformCssVariables = false, extractModules = true } = options;

  // use babel-plugin-import to extract code
  if (extractModules !== false) {
    console.log(chalk.yellow('[plugin-fusion-mobile]: extracting code for modules: @alifd/meet, @alifd/meet-react'));
    onGetWebpackConfig((config) => {
      setImport(config);
    });
  }

  // try to remove all css-vars to reduce css bundle size
  if (transformCssVariables !== false) {
    onHook('after.build.compile', (multiStats) => {
      const stats = multiStats?.stats?.stats || [];

      stats.forEach((stat) => {
        const { compilation } = stat;
        const { assets } = compilation;
        const bundleCSSFileNames = Object.keys(assets).filter((filename) => /bundle.css\.[a-z]{2}ss$/.test(filename));

        if (bundleCSSFileNames && bundleCSSFileNames.length > 0) {
          const filePath = assets[bundleCSSFileNames[0]].existsAt;
          const originalFileStats = fs.statSync(filePath);

          if (fs.existsSync(filePath)) {
            removeCssVar(filePath, () => {
              const newFileStats = fs.statSync(filePath);

              console.log(
                chalk.yellow(
                  `[plugin-fusion-mobile] tranformed css variables at: ${chalk.underline(filePath)} (${Math.floor(
                    originalFileStats.size / 1024,
                  )}kb → ${Math.floor(newFileStats.size / 1024)}kb)`,
                ),
              );
            });
          }
        }
      });
    });
  }
};
