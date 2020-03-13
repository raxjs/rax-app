const path = require('path');
const getWebpackBase = require('rax-webpack-config');
const getBabelConfig = require('rax-babel-config');
const getEntryName = require('./getEntryName');
const EntryPlugin = require('./entryPlugin');

const EntryLoader = require.resolve('./entryLoader');

// Can‘t clone webpack chain object, so generate a new chain and reset config
module.exports = (context) => {
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

  const { plugins, inlineStyle } = userConfig;
  const isMultiPages = !!~plugins.indexOf('build-plugin-rax-multi-pages');
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

  if (!userConfig.inlineStyle) {
    config.plugins.delete('minicss');
    config.module.rules.delete('css');
    config.module.rule('css')
      .test(/\.css?$/)
      .use('ignorecss')
      .loader(require.resolve('null-loader'))
      .end();

    config.module.rules.delete('less');
    config.module.rule('less')
      .test(/\.less?$/)
      .use('ignorecss')
      .loader(require.resolve('null-loader'))
      .end();
  }

  console.log('aaaaaaaa')
  return config;
};
