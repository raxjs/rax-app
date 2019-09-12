const funcBuilder = require('./funcBuilder');

module.exports = (api, options) => {
  const { context } = api;
  const { command } = context;

  if (command === 'build') {
    funcBuilder(api, options);
  }
};
