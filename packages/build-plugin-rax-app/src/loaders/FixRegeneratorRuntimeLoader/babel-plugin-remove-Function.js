module.exports = function visitor() {
  return {
    visitor: {
      CallExpression(path) {
        const { node } = path;
        if(
          node.callee.name === 'Function' &&
          node.arguments &&
          node.arguments.length === 2 &&
          node.arguments[0].value === 'r' &&
          node.arguments[1].value === 'regeneratorRuntime = r'
        ) {
          // Remove `Function('r', 'regeneratorRuntime = r')(runtime)`
          // Because Alibaba Miniapp doesn't allow use `Function`
          path.parentPath.remove();
        }
      }
    }
  }
}
