
const path = require('path');
const SourceMap = require('source-map');
const { getRouteName } = require('rax-compile-config');
const ErrorStackParser = require('error-stack-parser');
const parseErrorStack = require('./parseEvalStackTrace');
const extractSourceMap = require('./extractSourceMap');

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
  const isMultiPages = !!~plugins.indexOf('rax-plugin-multi-pages');

  config.mode('development');

  const absoluteAppJSONPath = path.join(rootDir, 'src/app.json');
  const appJSON = require(absoluteAppJSONPath);

  const distDir = config.output.get('path');
  const filename = config.output.get('filename');

  const routes = [];

  appJSON.routes.forEach((route) => {
    const pathName = getRouteName(route, rootDir);
    let routePath = route.path;
    if (isMultiPages) {
      routePath = new RegExp(`/pages/${pathName}\\/?((?!\\.(js|html|css|json)).)*$`);
    }
    routes.push({
      path: routePath,
      component: path.join(distDir, filename.replace('[name]', pathName)),
    });
  });

  config.devServer.hot(false);

  config.devServer.set('before', (app, devServer) => {
    const memFs = devServer.compiler.compilers[0].outputFileSystem;
    routes.forEach((route) => {
      app.get(route.path, function(req, res) {
        const bundleContent = memFs.readFileSync(route.component, 'utf8');

        process.once('unhandledRejection', (error) => printErrorStack(error, bundleContent));

        try {
          const mod = eval(bundleContent); // eslint-disable-line
          const page = mod.default || mod;
          page.render(req, res);
        } catch (error) {
          printErrorStack(error, bundleContent);
        }
      });
    });
  });

  return config;
};
