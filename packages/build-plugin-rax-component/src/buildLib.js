const chalk = require('chalk');

const gulpCompile = require('./gulp/compile');
const gulpParams = require('./gulp/params');

// TODO: 这里不是真正的 async，并没有等待 gulpCompile 方法执行完成，后续可以考虑不依赖 gulp（大炮打蚊子）
module.exports = async(api, options = {}) => {
  const { log } = api;
  log.info('component', chalk.green('Build start... '));

  // set gulpParams
  gulpParams.api = api;
  gulpParams.options = options;

  gulpCompile();
};
