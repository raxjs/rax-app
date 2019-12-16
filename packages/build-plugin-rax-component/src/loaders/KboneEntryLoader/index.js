const babel = require('@babel/core');

module.exports = function (content) {
  const parserOpts = {
    plugins: [
      'classProperties',
      'jsx',
      'typescript',
      'trailingFunctionCommas',
      'asyncFunctions',
      'exponentiationOperator',
      'asyncGenerators',
      'objectRestSpread',
      ['decorators', { decoratorsBeforeExport: false }],
      'dynamicImport',
    ], // Support all plugins
  };

  const { code } = babel.transformSync(content, {
    plugins: [
      require('./babel-plugin-wrap-runapp'),
    ],
    parserOpts,
  });

  return code;
};