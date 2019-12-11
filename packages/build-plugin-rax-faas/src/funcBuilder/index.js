const generateFuncPath = require('./generateFuncPath');
const buildFunctions = require('./buildFunctions');

module.exports = (api, functionConfig) => {
  const { context } = api;
  const { rootDir } = context;

  const funcs = generateFuncPath(rootDir, functionConfig);

  buildFunctions(context, funcs);
};
