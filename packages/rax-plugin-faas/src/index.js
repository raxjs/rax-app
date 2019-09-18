const dev = require('./dev');
const funcBuilder = require('./funcBuilder');

const defaultFncConfig = {
  name: 'index',
  trigger: 'http',
  handler: 'index.handler',
  method: ['GET'],
}

module.exports = (api, options) => {
  const { context } = api;
  const { command } = context;
  options.functions = options.functions.map(v => {
    return Object.assign({}, defaultFncConfig, v);
  })

  if (command === 'dev') {
    dev(api, options);
  }

  if (command === 'build') {
    funcBuilder(api, options);
  }
};
