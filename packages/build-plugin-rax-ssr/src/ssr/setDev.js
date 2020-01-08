
const path = require('path');
const SourceMap = require('source-map');
const { getRouteName } = require('rax-compile-config');
const ErrorStackParser = require('error-stack-parser');
const parseErrorStack = require('./parseEvalStackTrace');
const extractSourceMap = require('./extractSourceMap');
const renderPagePortal = require('./renderPagePortal');

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
  const { rootDir, userConfig } = context;
  const { plugins } = userConfig;
  const isMultiPages = !!~plugins.indexOf('build-plugin-rax-multi-pages');

  config.mode('development');

  const absoluteAppJSONPath = path.join(rootDir, 'src/app.json');
  const appJSON = require(absoluteAppJSONPath);

  const distDir = config.output.get('path');
  const filename = config.output.get('filename');

  const routes = [];

  appJSON.routes.forEach((route) => {
    const pathName = getRouteName(route, rootDir);
    routes.push({
      path: isMultiPages ? `/pages/${pathName}` : route.path,
      component: path.join(distDir, filename.replace('[name]', pathName)),
      entryName: pathName,
    });
  });

  config.devServer.hot(false);

  // This config will overwrite config in other plugin.
  config.devServer.set('before', (app, devServer) => {
    const memFs = devServer.compiler.compilers[0].outputFileSystem;

    // Render the page portal
    if (isMultiPages) {
      app.get('/', function(req, res) {
        const html = renderPagePortal({
          entries: routes,
          hasWeb: true,
        });
        res.send(html);
      });
    }

    routes.forEach((route) => {
      app.get(route.path, function(req, res) {
        const bundleContent = memFs.readFileSync(route.component, 'utf8');

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
