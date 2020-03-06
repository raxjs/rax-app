const qs = require('qs');
const path = require('path');
const fs = require('fs-extra');
const klawSync = require('klaw-sync');
const getWebpackBase = require('../../config/getWebpackBase');

module.exports = (context, options) => {
  const { rootDir, userConfig } = context;
  const { pages, doctype, loader, staticExport, webConfig, configWebpack } = options;

  const config = getWebpackBase(context, {
    isSSR: true
  });

  config.target('node');

  config.output
    .libraryTarget('commonjs2');

  ['jsx', 'tsx'].forEach(tag => {
    config.module.rule(tag)
      .use('platform')
      .options({
        platform: 'node',
      });
  });

  const loaderForDocument = loader || require.resolve('./loader');
  const absoluteDocumentPath = getAbsoluteFilePath(rootDir, 'src/document/index');
  
  // Shell is enabled by config in app.json
  const appConfig = fs.readJsonSync(path.join(rootDir, 'src/app.json'));
  const shellPath = appConfig.shell && appConfig.shell.source;
  const absoluteShellPath = shellPath ? getAbsoluteFilePath(rootDir, path.join('src', shellPath)) : null;

  pages.forEach((page) => {
    const { entryName, source } = page;

    const query = {
      absoluteDocumentPath,
      absoluteShellPath,
      absolutePagePath: staticExport && source ? getAbsoluteFilePath(rootDir, path.join('src', source)) : '',
      pagePath: page.path,
      doctype: doctype
    };

    const documentTempFile = '__' + entryName.replace(/\//g, '_') + '_doucment';
    config.entry(documentTempFile).add(`${loaderForDocument}?${qs.stringify(query)}!${absoluteDocumentPath}`);
  });

  // Sync the alias from webpack config for Web. eg. react, react-dom
  const aliasForWeb = webConfig.resolve ? webConfig.resolve.alias : {};
  Object.keys(aliasForWeb).forEach((key) => {
    config.resolve.alias.set(key, aliasForWeb[key]);
  });

  // Sync the user config in build.json to document config.
  const files = klawSync(path.resolve(__dirname, '../../config/user/keys'));
  files.map(fileInfo => {
    const userConfigKey = path.basename(fileInfo.path).replace('.js', '');
    const userConfigRegister = require(fileInfo.path);
    const value = userConfig[userConfigKey] || userConfigRegister.defaultValue;
    userConfigRegister.configWebpack(config, value, {
      ...context,
      taskName: 'node',
    });
  });

  // Sync the custom config for document.
  if (configWebpack) {
    configWebpack(config);
  }

  return config;
};

function getAbsoluteFilePath(rootDir, filePath) {
  const exts = ['.js', '.jsx', '.tsx'];

  const files = exts.map((ext) => {
    return `${path.join(rootDir, filePath)}${ext}`;
  });

  return files.find((f) => fs.existsSync(f));
}
