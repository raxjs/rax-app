const chalk = require('chalk');

const gulpCompile = require('./gulp/compile');
const gulpParams = require('./gulp/params');

module.exports = (api, options = {}) => {
  const { log } = api;
  log.info('component', chalk.green('Build start... '));

  // set gulpParams
  gulpParams.api = api;
  gulpParams.options = options;

  gulpCompile();
};
