const gulpCompile = require('./gulp/compile');
const gulpParams = require('./gulp/params');

module.exports = async(api, options) => {
  gulpParams.api = api;
  gulpParams.options = options;

  gulpCompile();
};
