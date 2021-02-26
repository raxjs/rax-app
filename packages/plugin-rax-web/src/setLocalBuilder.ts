import { getMpaEntries } from '@builder/app-helpers';
import * as qs from 'qs';
import LocalBuilderPlugin from './Plugins/LocalBuilderPlugin';
import { GET_RAX_APP_WEBPACK_CONFIG } from './constants';
import { updateEnableStatus } from './utils/localBuildCache';

export default (api, documentPath?: string | undefined) => {
  const { onGetWebpackConfig, getValue, context, registerTask } = api;
  const {
    userConfig: { inlineStyle, compileDependencies, web: webConfig = {} },
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
  process.on('exit', () => {
    updateEnableStatus(false);
  });
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
    const entries = getMpaEntries(api, {
      target: 'document',
      appJsonContent: staticConfig,
    });

    config.output.filename('[name].js');

    entries.forEach(({ entryName, entryPath }) => {
      config
        .entry(entryName)
        .add(
          `${require.resolve('./Loaders/render-loader')}?${qs.stringify({
            documentPath,
            staticExport: webConfig.staticExport,
          })}!${entryPath}`,
        );
    });
  });
};
