module.exports = function visitor() {
  return {
    visitor: {
      CallExpression(path) {
        const { node } = path;
        const callee = node.callee.callee;
        if (
          callee &&
          callee.name === 'Function' &&
          node.callee.arguments &&
          node.callee.arguments.length === 2 &&
          node.callee.arguments[0].value === 'r' &&
          node.callee.arguments[1].value === 'regeneratorRuntime = r'
        ) {
          // Remove `Function('r', 'regeneratorRuntime = r')(runtime)`
          // Because Alibaba Miniapp doesn't allow use `Function`
          path.parentPath.remove();
        }
      }
    }
  };
};
