const ErrorStackParser = require('error-stack-parser');
const SourceMap = require('source-map');

async function parse(error, bundleContent) {
  const sourcemap = getSourceMap(bundleContent);
  const consumer = await new SourceMap.SourceMapConsumer(sourcemap);
  const originalErrorStack = ErrorStackParser.parse(error);

  const mergedErrorStack = originalErrorStack.map((err, index) => {
    const errorFrame = originalErrorStack[index];
    const originalSourcePosition = consumer.originalPositionFor({
      line: errorFrame.lineNumber,
      column: errorFrame.columnNumber,
    });

    if (originalSourcePosition.name) {
      errorFrame.columnNumber = originalSourcePosition.column;
      errorFrame.lineNumber = originalSourcePosition.line;
      errorFrame.fileName = originalSourcePosition.name;
      errorFrame.source = `    at ${originalSourcePosition.functionName} (${parseWebpackPath(originalSourcePosition.source)}:${originalSourcePosition.lineNumber}:${originalSourcePosition.columnNumber})`;
    }

    return errorFrame;
  });

  consumer.destroy();

  return mergedErrorStack;
}

function print(message, stackFrame) {
  const stackMessage = stackFrame.map(frame => frame.source);

  console.error(`Error: ${message}\n${stackMessage.join('\n')}`);
}

/**
 * The inline-source-map plugin in dev mode will
 * embed the source-map information in the last line of file.
 * @param bundleContent the source code of SSR
 * @returns {Object}
 */
function getSourceMap(bundleContent) {
  const readStart = bundleContent.lastIndexOf('\n');
  const rawSourceMap = bundleContent.substr(readStart + 1);
  const headSlice = rawSourceMap.slice(0, 100);

  if (headSlice.indexOf('sourceMappingURL') < 0) {
    return null;
  }

  const base64KeyWord = 'base64,';
  const base64Start = rawSourceMap.indexOf(base64KeyWord);
  const base64 = rawSourceMap.substr(base64Start + base64KeyWord.length);

  const sourceMapString = Buffer.from(base64, 'base64').toString('utf-8');
  return JSON.parse(sourceMapString);
}

/**
 * parser webpack path
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

module.exports = {
  parse,
  print
};
