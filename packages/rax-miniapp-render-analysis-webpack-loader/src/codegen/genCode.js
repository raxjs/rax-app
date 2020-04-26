const generate = require('@babel/generator').default;

/**
 * Generate code and map from babel ast.
 * @param ast
 */
function genCode(ast) {
  return generate(ast);
}

module.exports = genCode;
