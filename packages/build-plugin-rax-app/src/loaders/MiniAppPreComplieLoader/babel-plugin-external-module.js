
module.exports = function visitor({ types: t }) {
  return {
    visitor: {
      CallExpression(path) {
        const { node } = path;
        if (
          node.callee.name === 'require' &&
          node.arguments &&
          node.arguments.length === 1 &&
          t.isStringLiteral(node.arguments[0]) &&
          (node.arguments[0].value.indexOf('@weex-module') > -1 || node.arguments[0].value.indexOf('@system') > -1)
        ) {
          // Avoid weex and quickapp module effect
          path.replaceWith(t.nullLiteral());
        }
      }
    }
  };
};
