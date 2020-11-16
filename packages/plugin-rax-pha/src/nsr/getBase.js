const qs = require('qs');
const path = require('path');
const getWebpackBase = require('rax-webpack-config');
const getBabelConfig = require('rax-babel-config');
const getEntryName = require('./getEntryName');

const EntryLoader = require.resolve('./entryLoader');

function setEntry(config, context, entries) {
  const { rootDir } = context;
  const absoluteShellPath = path.join(rootDir, 'src/shell/index.jsx');

  entries.forEach((entry) => {
    const {
      name,
      sourcePath,
      pagePath,
    } = entry;
    const entryConfig = config.entry(name);

    const query = {
      pagePath,
      absoluteShellPath,
    };

    entryConfig.add(`${EntryLoader}?${qs.stringify(query)}!${sourcePath}`);
  });
}

module.exports = (context) => {
  const { userConfig, rootDir } = context;
  const { inlineStyle = true } = userConfig;

  const babelConfig = getBabelConfig({
    styleSheet: true,
    jsxToHtml: true,
    isNode: true,
  });

  const config = getWebpackBase({
    ...context,
    babelConfig,
  });

  const appJSON = require(path.resolve(rootDir, 'src/app.json'));
  const entries = appJSON.routes.map((route) => {
    return {
      name: getEntryName(route.path),
      sourcePath: path.join(rootDir, 'src', route.source),
      pagePath: route.path,
    };
  });

  setEntry(config, context, entries);

  config.output
    .filename('web/[name].nsr.js')
    .libraryTarget('umd');

  if (!inlineStyle) {
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
