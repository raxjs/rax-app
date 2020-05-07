const CodeError = require('../utils/CodeError');
const getPagePath = require('../utils/getPagePath');

module.exports = function visitor({ types: t }, { nativeLifeCycleMap, routes }, rootDir) {
  return {
    visitor: {
      CallExpression(path, { file: { opts: { filename }, code } }) {
        const pagePath = getPagePath(rootDir, filename, routes, nativeLifeCycleMap);
        if (pagePath) {
          const nativeLifeCycle = nativeLifeCycleMap[pagePath];
          if (t.isIdentifier(path.node.callee, {
            name: 'registerNativeEventListeners'
          })) {
            if (t.isArrayExpression(path.node.arguments[1])) {
              path.node.arguments[1].elements.forEach(element => {
                nativeLifeCycle[element.value] = true;
              });
            } else {
              throw new CodeError(code, path.node, path.node.loc,
                "registerNativeEventListeners's second argument should be an array, like ['onReachBottom']");
            }
          }
        } else {
          path.skip();
        }
      }
    }
  };
};
