import { getMpaEntries } from '@builder/app-helpers';
import * as qs from 'qs';
import * as fs from 'fs';
import * as chokidar from 'chokidar';
import LocalBuilderPlugin from './Plugins/LocalBuilderPlugin';
import { GET_RAX_APP_WEBPACK_CONFIG } from './constants';
import { updateEnableStatus, updateNeedWaiting } from './utils/localBuildCache';
import getAppEntry from './utils/getAppEntry';

export default (api, documentPath?: string | undefined) => {
  const { onGetWebpackConfig, getValue, context, registerTask } = api;
  const {
    userConfig: { inlineStyle, compileDependencies, web: webConfig = {} },
    rootDir,
    command,
  } = context;

  const getWebpackBase = getValue(GET_RAX_APP_WEBPACK_CONFIG);
  const baseConfig = getWebpackBase(api, {
    target: 'document',
    babelConfigOptions: { styleSheet: inlineStyle },
    isNode: true,
  });
  baseConfig.name('document');

  baseConfig.plugins.delete('ProgressPlugin');

  baseConfig.target('node');
  baseConfig.output.libraryTarget('commonjs2');

  // do not copy public
  if (baseConfig.plugins.has('CopyWebpackPlugin')) {
    baseConfig.plugins.delete('CopyWebpackPlugin');
  }

  // enable listen local build result
  updateEnableStatus(true);
  // let web task know, it need waiting local builder task
  updateNeedWaiting(true);

  baseConfig.plugin('LocalBuilderPlugin').use(LocalBuilderPlugin);

  // document does not compile node_modules in full
  if (compileDependencies.length === 1 && compileDependencies[0] === '') {
    ['jsx', 'tsx'].forEach((rule) => {
      baseConfig.module
        .rule(rule)
        .exclude.clear()
        .add(/node_modules/);
    });
  }

  registerTask('document', baseConfig);

  onGetWebpackConfig('document', (config) => {
    const staticConfig = getValue('staticConfig');
    let entries;
    if (webConfig.mpa) {
      entries = getMpaEntries(api, {
        target: 'document',
        appJsonContent: staticConfig,
      });
    } else {
      entries = [getAppEntry(rootDir)];
    }

    // Watch document change and rewrite page entry file
    if (command === 'start' && documentPath) {
      addReloadByDocumentChange(rootDir, entries);
    }

    config.output.filename('[name].js');

    entries.forEach(({ entryName, entryPath }) => {
      let entry = entryPath;
      if (documentPath) {
        entry = documentPath;
      }
      config.entry(entryName).add(
        `${require.resolve('./Loaders/render-loader')}?${qs.stringify({
          documentPath,
          entryPath,
          staticExport: webConfig.staticExport,
        })}!${entry}`,
      );
    });
  });
};

function addReloadByDocumentChange(rootDir, entries) {
  const watcher = chokidar.watch(`${rootDir}/src/document/index.@(tsx|js?(x))`, {
    ignoreInitial: true,
  });
  watcher.on('change', () => {
    updateNeedWaiting(true);
    const contents = entries.map(({ entryPath }) => ({
      entryPath,
      content: fs.readFileSync(entryPath, { encoding: 'utf-8' }),
    }));
    contents.forEach(({ entryPath, content }) => {
      fs.writeFileSync(entryPath, content);
    });
  });
}
