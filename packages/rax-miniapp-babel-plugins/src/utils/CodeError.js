const { codeFrameColumns } = require('@babel/code-frame');

function createErrorMessage(sourceCode, loc, extraMessage) {
  try {
    return codeFrameColumns(sourceCode, loc, { highlightCode: true, message: extraMessage });
  } catch (err) {
    return 'Failed to locate source code position.';
  }
}

class CodeError extends Error {
  constructor(sourceCode, loc, message) {
    super('\n' + createErrorMessage(sourceCode, loc, message));
  }
}

module.exports = CodeError;
