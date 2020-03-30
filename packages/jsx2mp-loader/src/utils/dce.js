const { transformSync } = require('@babel/core');

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
  ], // support all plugins
};

function removeUnusedImport(source) {
  return transformSync(source, {
    parserOpts,
    plugins: [
      [
        require('babel-plugin-danger-remove-unused-import'),
        {
          ignore: 'rax'
        }
      ]
    ]
  }).code;
}

function removeDeadCode(source) {
  return transformSync(source, {
    parserOpts,
    plugins: [
      [
        require('babel-plugin-minify-dead-code-elimination'),
        {
          optimizeRawSize: true,
          keepFnName: true
        }
      ]
    ]
  }).code;
}

function eliminateDeadCode(source) {
  return removeUnusedImport(removeDeadCode(source));
}

module.exports = eliminateDeadCode;
