const chalk = require('chalk');

const gulpCompile = require('./gulp/compile');
const gulpParams = require('./gulp/params');

const jsx2mpBuilder = require('./config/miniapp/build');
const { MINIAPP, WECHAT_MINIPROGRAM } = require('./constants');

module.exports = async(api, options = {}) => {
  const { log } = api;
  log.info('component', chalk.green('Build start... '));

  // set gulpParams
  gulpParams.api = api;
  gulpParams.options = options;

  gulpCompile();
};
