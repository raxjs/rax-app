const generateFunctionConfig = require('./generateFunctionConfig');

const dev = require('./dev');
const build = require('./build');

module.exports = (api, options) => {
  const { context } = api;
  const { command } = context;
  const functionConfig = generateFunctionConfig(api.context, options);

  if (command === 'start') {
    dev(api, functionConfig);
  }

  if (command === 'build') {
    build(api, functionConfig, options);
  }
};
