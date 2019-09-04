/**
 * 提取错误信息中，eval内部代码的错误行数
 * @param error
 * @returns {[]}
 */
function parseEvalStackTrace(error) {
  const stack = error.stack;
  const regex = /<anonymous>:(\d+):(\d+)/g;
  let pattern = regex.exec(stack);
  const lineAndColumns = [];
  while (pattern) {
    const line = Number(pattern[1]);
    const column = Number(pattern[2]);

    lineAndColumns.push([line, column]);
    pattern = regex.exec(stack);
  }

  return lineAndColumns;
}

/**
 * 处理webpack路径
 * @param pathString
 * @returns {string|*}
 */
function parseWebpackPath(pathString) {
  if (!pathString) {
    return pathString;
  }

  const webpackIdentify = 'webpack://';
  const webpackIndex = pathString.indexOf(webpackIdentify);
  if (webpackIndex < 0) {
    return pathString;
  }

  const base = process.cwd();
  let src = pathString.substr(webpackIndex + webpackIdentify.length + 1);

  const queryIndex = src.lastIndexOf('?');
  if (queryIndex >= 0) {
    src = src.substring(0, queryIndex);
  }

  return `${base}/${src}`;
}

function printError(message, stackFrame) {
  const stackMessage = stackFrame.map(frame => {
    return `  at ${frame.functionName} (${frame.source}:${frame.lineNumber}:${frame.columnNumber})`;
  });

  console.error(`Error: ${message}\n${stackMessage.join('\n')}`);
}

exports.parseEvalStackTrace = parseEvalStackTrace;
exports.parseWebpackPath = parseWebpackPath;
exports.printError = printError;
