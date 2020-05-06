const CodeError = require('./CodeError');

module.exports = function visitor({ types: t }, { nativeLifeCycle, code }) {
  return {
    visitor: {
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee, {
          name: 'registerNativeEventListeners'
        })) {
          if (t.isArrayExpression(path.node.arguments[1])) {
            path.node.arguments[1].elements.forEach(element => {
              nativeLifeCycle[element.value] = true;
            });
          } else {
            throw new CodeError(code, path.node, path.node.loc,
              "registerNativeEventListeners's second argument should be an array, like ['onShow']");
          }
        }
      }
    }
  };
};
