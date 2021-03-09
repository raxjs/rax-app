const { getPHADevUrls } = require('./phaDevUrls');

module.exports = function (api) {
  const { registerMethod } = api;
  registerMethod('rax.getPHADevUrls', getPHADevUrls);
};
