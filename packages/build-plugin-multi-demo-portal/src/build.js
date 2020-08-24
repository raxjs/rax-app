const path = require('path');
const chalk = require('chalk');
const consoleClear = require('console-clear');
const { handleWebpackErr } = require('rax-compile-config');
const modifyPkgHomePage = require('./config/modifyPkgHomePage');
const getDistConfig = require('./config/getDistConfig');

module.exports = (api, options = {}) => {
  const { registerTask, context, onHook, onGetWebpackConfig } = api;

  const config = getDistConfig(context, options);

  registerTask('component-multi-demo-portal', config);

  onGetWebpackConfig('component-multi-demo-portal', (config) => {
    config.output.path(path.join(context.rootDir, 'build'));
  });

  onHook('after.build.compile', async({ err, stats }) => {
    consoleClear(true);

    if (!handleWebpackErr(err, stats)) {
      return;
    }
    
    modifyPkgHomePage(pkg, rootDir);

    console.log(chalk.green('Portal page has been built'));
    console.log();
  });
};
