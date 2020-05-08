const { codeFrameColumns } = require('@babel/code-frame');

function createErrorMessage(sourceCode, node, loc, extraMessage) {
  try {
    return codeFrameColumns(sourceCode, loc, { highlightCode: true, message: extraMessage });
  } catch (err) {
    return 'Failed to locate source code position.';
  }
}

class CodeError extends Error {
  constructor(sourceCode, node, loc, message) {
    super('\n' + createErrorMessage(sourceCode, node, loc, message));
    this.node = node;
  }
}

module.exports = CodeError;
