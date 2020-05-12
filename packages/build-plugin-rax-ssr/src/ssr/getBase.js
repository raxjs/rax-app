const path = require('path');
const getWebpackBase = require('rax-webpack-config');
const getBabelConfig = require('rax-babel-config');
const EntryPlugin = require('./entryPlugin');

const EntryLoader = require.resolve('./entryLoader');

// Can‘t clone webpack chain object, so generate a new chain and reset config
module.exports = (context, routes) => {
  const { userConfig, rootDir } = context;

  const babelConfig = getBabelConfig({
    styleSheet: true,
    jsxToHtml: true,
    isNode: true
  });

  const config = getWebpackBase({
    ...context,
    babelConfig: babelConfig,
  });

  config.target('node');
  config.name('ssr');

  const entries = routes.map((route) => {
    return {
      name: route.entryName,
      sourcePath: path.join(rootDir, 'src', route.source),
      pagePath: route.path,
    };
  });

  config.plugin('entryPlugin')
    .use(EntryPlugin, [{
      entries,
      loader: EntryLoader,
      absoluteDocumentPath: path.join(rootDir, 'src/document/index.jsx'),
      absoluteShellPath: path.join(rootDir, 'src/shell/index.jsx'),
    }]);

  config.output
    .filename('node/[name].js')
    .libraryTarget('commonjs2');

  const {inlineStyle = true } = userConfig;

  if (!inlineStyle) {
    // there is no need to generate css file in node
    config.module.rule('ignorecss')
      .test(/\.(css|less|saas|scss)?$/)
      .use('ignorecss')
      .loader(require.resolve('null-loader'))
      .end();
  }

  return config;
};
