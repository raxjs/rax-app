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

const codeProcessor = (processors = [], sourceCode) => processors
  .filter(processor => typeof processor === 'function')
  .reduce(
    (prevCode, currProcessor) => currProcessor(prevCode),
    sourceCode
  );

function eliminateDeadCode(source, options = {}) {
  const { platform = {} } = options;
  const processors = [
    platform.type !== 'wechat' && removeDeadCode,
    removeUnusedImport,
  ];

  return codeProcessor(processors, source);
}

module.exports = eliminateDeadCode;
