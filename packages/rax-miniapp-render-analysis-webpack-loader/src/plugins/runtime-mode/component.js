const t = require('@babel/types');
const traverse = require('../../utils/traverseNodePath');
const genExpression = require('../../codegen/genExpression');
const CodeError = require('../../utils/CodeError');

function analyzeComponent(ast, code, adapter) {
  traverse(ast, {
    JSXOpeningElement(path) {
    },
    SequenceExpression(path) {
      if (path.node.expressions.length === 2 && genExpression(path.node) === '0, _rax.createElement') {
      }
    }
  });
}

module.exports = {
  parse(parsed, code, options) {
    analyzeComponent(parsed.ast);
  },
};
