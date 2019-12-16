
module.exports = function visitor({ types: t }, options) {
  return {
    visitor: {
      CallExpression(path) {
        const { node } = path;

        if (t.isIdentifier(node.callee) && node.callee.name === 'runApp' && !node._isWrapped) {
          node._isWrapped = true;

          const createAppNode = t.exportDefaultDeclaration(t.functionDeclaration(
            t.identifier('createApp'),
            [],
            t.blockStatement([path.parentPath.node])
          ));

          path.parentPath.replaceWith(createAppNode);
        }
      }
    }
  }
}
