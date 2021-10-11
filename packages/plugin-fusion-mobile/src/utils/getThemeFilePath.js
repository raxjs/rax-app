const fs = require('fs-extra');
const chalk = require('chalk');
const { join } = require('path');

// meet built-in theme
const DEFAULT_THEME_FILE = '@alifd/meet/es/core/index.css';

module.exports = (rootDir, themePackage) => {
  const nodeModulesDir = join(rootDir, 'node_modules');
  let themeFilePath = '';

  if (themePackage) {
    if (/index\.css$/.test(themePackage)) {
      themeFilePath = join(nodeModulesDir, themePackage);
    } else {
      themeFilePath = join(nodeModulesDir, themePackage, 'index.css');
    }
  } else {
    themeFilePath = join(nodeModulesDir, DEFAULT_THEME_FILE);
  }

  if (!fs.existsSync(themeFilePath)) {
    console.log(chalk.red('[build-plugin-fusion-mobile] cannot get theme file at: \n'));
    console.log(`  ${chalk.red.underline(themeFilePath)}`);
    console.log(' ');

    themeFilePath = '';
  }

  return themeFilePath;
};
