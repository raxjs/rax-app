
const path = require('path');
const SourceMap = require('source-map');
const ErrorStackParser = require('error-stack-parser');
const parseErrorStack = require('./parseEvalStackTrace');
const extractSourceMap = require('./extractSourceMap');
const getEntryName = require('./getEntryName');

function printErrorStack(error, bundleContent) {
  const sourcemap = extractSourceMap.getSourceMap(bundleContent);
  const sourceMapConsumer = new SourceMap.SourceMapConsumer(sourcemap);
  // error-stack-parser can't parse the error message with eval, and it needs to be processed again.
  const originalErrorStack = ErrorStackParser.parse(error);

  sourceMapConsumer.then(consumer => {
    const errorLineAndColumn = parseErrorStack.parseEvalStackTrace(error);
    const mergedErrorStack = errorLineAndColumn.map(([line, column], index) => {
      const errorFrame = originalErrorStack[index];
      const originalSourcePosition = consumer.originalPositionFor({
        line,
        column,
      });
      errorFrame.columnNumber = originalSourcePosition.column;
      errorFrame.lineNumber = originalSourcePosition.line;
      errorFrame.fileName = originalSourcePosition.name;
      errorFrame.source = parseErrorStack.parseWebpackPath(originalSourcePosition.source);
      return errorFrame;
    });

    parseErrorStack.printError(error.message, mergedErrorStack);
  });
}

module.exports = (config, context) => {
  const { rootDir } = context;

  config.mode('development');

  const absoluteAppJSONPath = path.join(rootDir, 'src/app.json');
  const appJSON = require(absoluteAppJSONPath);

  const distDir = config.output.get('path');
  const filename = config.output.get('filename');
  const routes = appJSON.routes;

  routes.forEach((route) => {
    const entryName = getEntryName(route.path);
    routes.entryName = entryName;
    routes.componentPath = path.join(distDir, filename.replace('[name]', entryName));
  });

  config.devServer.hot(false);

  // There can only be one `before` config, this config will overwrite `before` config in web plugin.
  config.devServer.set('before', (app, devServer) => {
    // outputFileSystem in devServer is MemoryFileSystem by defalut, but it can also be custom with other file systems.
    const outputFs = devServer.compiler.compilers[0].outputFileSystem;
    routes.forEach((route) => {
      app.get(route.path, function(req, res) {
        const bundleContent = outputFs.readFileSync(route.componentPath, 'utf8');

        process.once('unhandledRejection', (error) => printErrorStack(error, bundleContent));

        try {
          const mod = eval(bundleContent); // eslint-disable-line
          mod.render(req, res);
        } catch (error) {
          printErrorStack(error, bundleContent);
        }
      });
    });
  });

  return config;
};
