const setConfig = require('./setConfig');
const setDevLog = require('./setDevLog');

module.exports = {
  // Set MPA Webpack Config.
  setConfig,
  // Set logs when dev server started.
  // You will see "Multi pages development server at: xxx" in console.
  setDevLog
};