const qs = require('qs');
const path = require('path');
const fs = require('fs-extra');
const getWebpackBase = require('../getWebpackBase');
const setUserConfig = require('../user/setConfig');

const DocumentLoader = require.resolve('../../loaders/DocumentLoader/');

const USERCONFIGKEY_IGNORED = {
  hash: true, // There is no need to change output config no matter `hash` is `true` or `false`
};

module.exports = (context, options) => {
  const { rootDir, userConfig } = context;
  const { pages, publicPath, doctype, loader, staticExport, webConfig, configWebpack } = options;
  const { inlineStyle } = userConfig;

  const aliasForWeb = webConfig.resolve ? webConfig.resolve.alias : {};
  const filenameForWeb = webConfig.output.filename;
  const publicPathForWeb = webConfig.output.publicPath;

  const publicPathForDocument = publicPath || publicPathForWeb;
  const loaderForDocument = loader || DocumentLoader;

  // Shell is enabled by config in app.json
  const appConfig = fs.readJsonSync(path.join(rootDir, 'src/app.json'));
  const shellPath = appConfig.shell && appConfig.shell.source;
  const absoluteShellPath = shellPath ? getAbsoluteFilePath(rootDir, path.join('src', shellPath)) : null;
  const absoluteDocumentPath = getAbsoluteFilePath(rootDir, 'src/document/index');

  const config = getWebpackBase(context, {
    isSSR: true,
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

  pages.forEach((page) => {
    const { entryName, source } = page;

    /**
     * Get script path by filename and entryname.
     * eg: filename: 'web/[name].js', entryname: 'index', so the script path is web/index.js
     */
    const scriptPath = filenameForWeb.includes('[name]') ? filenameForWeb.replace('[name]', entryName) : `${entryName}.js`;
    const scriptWithPublicPath = path.join(publicPathForDocument, scriptPath);

    const query = {
      absoluteDocumentPath,
      absoluteShellPath,
      absolutePagePath: staticExport && source ? getAbsoluteFilePath(rootDir, path.join('src', source)) : '',
      pagePath: page.path,
      styles: inlineStyle ? [] : [ scriptWithPublicPath.replace('.js', '.css') ],
      scripts: [ scriptWithPublicPath ],
      doctype: doctype
    };

    const documentTempFile = '__' + entryName.replace(/\//g, '_') + '_doucment';
    config.entry(documentTempFile).add(`${loaderForDocument}?${qs.stringify(query)}!${absoluteDocumentPath}`);
  });

  // Sync the alias from webpack config for Web. eg. react, react-dom
  Object.keys(aliasForWeb).forEach((key) => {
    config.resolve.alias.set(key, aliasForWeb[key]);
  });

  // Disable process app.json file in base webpack config
  config.module.rules.delete('appJSON');

  /**
   * Map user config in build.json to webpack config.
   * In the normal entry task, `registerUserConfig` is called by `scripts-core`.
   * But here we get webpack config  for `Document` in sub webpack compiler.
   * To avoid pass `registerUserConfig` layer by layer, here we reimplement the `registerUserConfig`
   */
  setUserConfig({
    registerUserConfig: (registers) => {
      // Each registers define how keys in build.json be mapped to webpack config, they are defined in `../user/keys`
      registers.forEach((register) => {
        const userConfigKey = register.name;
        if (USERCONFIGKEY_IGNORED[userConfigKey]) {
          return;
        }

        if (register.configWebpack) {
          const value = userConfig[userConfigKey] || register.defaultValue;
          register.configWebpack(config, value, {
            ...context,
            taskName: 'node',
          });
        }
      });
    },
  });

  // Custom config for document though plugin
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
