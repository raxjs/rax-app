import * as qs from 'qs';
import * as fs from 'fs';
import * as path from 'path';
import * as chokidar from 'chokidar';
import LocalBuilderPlugin from './Plugins/LocalBuilderPlugin';
import { GET_RAX_APP_WEBPACK_CONFIG } from './constants';
import { updateEnableStatus } from './utils/localBuildCache';

export default (api, documentPath?: string | undefined) => {
  const { onGetWebpackConfig, getValue, context, registerTask, registerUserConfig, modifyUserConfig } = api;

  // Register document config key
  registerUserConfig({
    name: 'document',
    validation: 'object',
  });

  const {
    userConfig: { inlineStyle, compileDependencies, web: webConfig = {} },
    rootDir,
    command,
  } = context;

  if (webConfig.mpa) {
    // Modify mpa config key for document task with RouteLoader
    modifyUserConfig((originalConfig) => {
      return {
        ...originalConfig,
        document: {
          ...originalConfig.document,
          mpa: true,
        },
      };
    });
  }

  const tempPath = getValue('TEMP_PATH');

  const getWebpackBase = getValue(GET_RAX_APP_WEBPACK_CONFIG);
  const baseConfig = getWebpackBase(api, {
    target: 'document',
    babelConfigOptions: { styleSheet: inlineStyle },
  });
  baseConfig.name('document');

  baseConfig.plugins.delete('ProgressPlugin');

  baseConfig.output.libraryTarget('commonjs2');

  // do not copy public
  if (baseConfig.plugins.has('CopyWebpackPlugin')) {
    baseConfig.plugins.delete('CopyWebpackPlugin');
  }

  // enable listen local build result
  updateEnableStatus(true);

  baseConfig.plugin('LocalBuilderPlugin').use(LocalBuilderPlugin);

  // document does not compile node_modules in full
  if (compileDependencies.length === 1 && compileDependencies[0] === '') {
    ['jsx', 'tsx', 'swc'].forEach((rule) => {
      baseConfig.module
        .rule(rule)
        .exclude.clear()
        .add(/node_modules/);
    });
  }

  registerTask('document', baseConfig);

  let entries = [];
  onGetWebpackConfig('web', (config) => {
    const webEntries = config.entryPoints.entries();
    entries = Object.keys(webEntries).map((entryName) => {
      const entrySet = config.entry(entryName);
      const entryFiles = entrySet.values();
      // Transform hmr-loader.js!entryPath to [hmr-loader, entryPath]
      const entrySeparatedLoader = entryFiles[entryFiles.length - 1].split('!');
      return {
        entryPath: entrySeparatedLoader[entrySeparatedLoader.length - 1],
        entryName,
      };
    });
  });

  onGetWebpackConfig('document', (config) => {
    config.target('node');
    // Watch document change and rewrite page entry file
    if (command === 'start' && documentPath) {
      addReloadByDocumentChange(rootDir, entries);
    }

    config.output.filename('[name].js');

    // Get redirect runApp info in MPA
    const { runApp: { multipleSource = [] } } = getValue('importDeclarations');

    entries.forEach(({ entryName, entryPath }) => {
      let entry = entryPath;
      if (documentPath) {
        entry = documentPath;
      }
      // Use core runApp path as default runApp implement
      let runAppPath = path.join(tempPath, 'core/runApp');
      if (multipleSource.length > 0) {
        const targetEntryInfo = multipleSource.find(({ filename }) => filename === entryPath);

        if (targetEntryInfo) {
          runAppPath = targetEntryInfo.value;
        }
      }

      config.entry(entryName).add(
        `${require.resolve('./Loaders/render-loader')}?${qs.stringify({
          documentPath,
          entryPath,
          tempPath,
          runAppPath,
          staticExport: webConfig.staticExport,
        })}!${entry}`,
      );
    });
  });
};

function addReloadByDocumentChange(rootDir, entries) {
  const watcher = chokidar.watch(`${rootDir}/src/document/**`, {
    ignoreInitial: true,
    atomic: 300,
  });
  watcher.on('change', () => {
    updateEnableStatus(true);
    const contents = entries.map(({ entryPath }) => ({
      entryPath,
      content: fs.readFileSync(entryPath, { encoding: 'utf-8' }),
    }));
    contents.forEach(({ entryPath, content }) => {
      fs.writeFileSync(entryPath, content);
    });
  });
}
