const getBabelConfig = require('./getBabelConfig');
const setBabelAlias = require('./setBabelAlias');
const handleWebpackErr = require('./handleWebpackErr');
const getRouteName = require('./getRouteName');
const platformLoader = require('./platformLoader');

const hmrClient = require.resolve('./hmr/webpackHotDevClient.entry');

module.exports = {
  getRouteName,
  getBabelConfig,
  setBabelAlias,
  hmrClient,
  handleWebpackErr,
  platformLoader,
};
