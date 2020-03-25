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

function eliminateDeadCode(source, options = {}) {
  const { platform = {} } = options;
  return transformSync(source, {
    parserOpts,
    plugins: [
      platform.type !== 'wechat' && [
        require('babel-plugin-minify-dead-code-elimination'),
        {
          optimizeRawSize: true,
          keepFnName: true
        }
      ],
      [
        require('babel-plugin-danger-remove-unused-import'),
        {
          ignore: 'rax'
        }
      ]
    ].filter(Boolean)
  }).code;
}

module.exports = eliminateDeadCode;
