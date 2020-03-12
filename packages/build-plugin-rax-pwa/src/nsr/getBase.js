const path = require('path');
const getWebpackBase = require('rax-webpack-config');
const getBabelConfig = require('rax-babel-config');
const setUserConfig = require('./setUserConfig');
const getEntryName = require('./getEntryName');
const EntryPlugin = require('./entryPlugin');

const EntryLoader = require.resolve('./entryLoader');

module.exports = (context) => {
  const { userConfig, rootDir } = context;

  const babelConfig = getBabelConfig({
    styleSheet: true,
    jsxToHtml: true,
  });

  const config = getWebpackBase({
    ...context,
    babelConfig: babelConfig,
  });

  setUserConfig(config, context);

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
    .filename('nsr/[name].js')
    .libraryTarget('umd');

  if (!userConfig.inlineStyle) {
    config.plugins.delete('minicss');
    config.module.rules.delete('css');
    config.module.rule('css')
      .test(/\.css?$/)
      .use('ignorecss')
      .loader(require.resolve('./ignoreLoader'))
      .end();
  }

  return config;
};
