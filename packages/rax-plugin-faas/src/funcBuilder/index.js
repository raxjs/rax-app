const generateFuncPath = require('./generateFuncPath');
const buildFunctions = require('./buildFunctions');

module.exports = (api, options) => {
  const { context } = api;
  const { rootDir } = context;

  const funcs = generateFuncPath(rootDir, options);

  buildFunctions(rootDir, funcs);
};
