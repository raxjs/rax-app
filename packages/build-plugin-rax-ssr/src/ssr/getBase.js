const path = require('path');
const getWebpackBase = require('rax-webpack-config');
const getBabelConfig = require('rax-babel-config');
const getEntryName = require('./getEntryName');
const EntryPlugin = require('./entryPlugin');

const EntryLoader = require.resolve('./entryLoader');

// Can‘t clone webpack chain object, so generate a new chain and reset config
module.exports = (context, getValue) => {
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

  const { plugins, inlineStyle = true } = userConfig;
  // build-plugin-rax-multi-pages is deprecated, but still need to be compatible.
  const isMultiPages = getValue('appType') === 'mpa' || !!~plugins.indexOf('build-plugin-rax-multi-pages');
  const appJSON = require(path.resolve(rootDir, 'src/app.json'));
  const entries = appJSON.routes.map((route) => {
    return {
      name: getEntryName(route.path),
      sourcePath: path.join(rootDir, 'src', route.source),
      pagePath: route.path,
    };
  });

  config.plugin('entryPlugin')
    .use(EntryPlugin, [{
      entries,
      loader: EntryLoader,
      isMultiPages: isMultiPages,
      isInlineStyle: inlineStyle,
      absoluteDocumentPath: path.join(rootDir, 'src/document/index.jsx'),
      absoluteShellPath: path.join(rootDir, 'src/shell/index.jsx'),
    }]);

  config.output
    .filename('node/[name].js')
    .libraryTarget('commonjs2');

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
