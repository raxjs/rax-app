const setConfig = require('./setConfig');
const setDevLog = require('./setDevLog');
const setDevServer = require('./setDevServer');

module.exports = {
  // Set MPA Webpack Config.
  setConfig,
  // Set logs when dev server started.
  // You will see "Multi pages development server at: xxx" in console.
  setDevLog,
  // Set MPA dev server.
  // You can preview you MPA pages though guide page.
  setDevServer
};