const t = require('@babel/types');
const traverse = require('../../utils/traverseNodePath');
const genExpression = require('../../codegen/genExpression');
const CodeError = require('../../utils/CodeError');

function analyzeNativeLifeCycle(ast, code, options) {
  traverse(ast, {
    CallExpression(path) {
      if (t.isIdentifier(path.node.callee, {
        name: 'registerNativeEventListeners'
      })) {
        if (t.isArrayExpression(path.node.arguments[1])) {
          path.node.arguments[1].elements.forEach(element => {
            options.nativeLifeCycleMap[options.filePath][element.value] = true;
          });
        } else {
          throw new CodeError(code, path.node, path.node.loc,
            "registerNativeEventListeners's second argument should be an array, like ['onShow']");
        }
      }
    }
  });
}

module.exports = {
  parse(parsed, code, options) {
    if (options.nativeLifeCycleMap[options.filePath]) {
      analyzeNativeLifeCycle(parsed.ast, code, options);
    }
  },
};
