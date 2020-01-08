
const path = require('path');
const fs = require('fs-extra');
const hbs = require('handlebars');
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

const MAIN_TEMPLATE = path.join(__dirname, '../template/main.hbs');
const hbsTemplateContent = fs.readFileSync(MAIN_TEMPLATE, 'utf-8');
const compileTemplateContent = hbs.compile(hbsTemplateContent);

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

  // There can only be one `before` config, this config will overwrite `before` config in web plugin.
  config.devServer.set('before', (app, devServer) => {
    // Render the page portal
    if (isMultiPages) {
      app.get('/', function(req, res) {
        const html = compileTemplateContent({
          entries: routes,
        });
        res.send(html);
      });
    }

    // outputFileSystem in devServer is MemoryFileSystem by defalut, but it can also be custom with other file systems.
    const outputFs = devServer.compiler.compilers[0].outputFileSystem;
    routes.forEach((route) => {
      app.get(route.path, function(req, res) {
        const bundleContent = outputFs.readFileSync(route.component, 'utf8');

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
