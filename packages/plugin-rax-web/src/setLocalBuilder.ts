import { getMpaEntries } from '@builder/app-helpers';
import * as path from 'path';
import LocalBuilderPlugin from './Plugins/LocalBuilderPlugin';
import { GET_RAX_APP_WEBPACK_CONFIG } from './constants';

export default (api) => {
  const { onGetWebpackConfig, getValue, context, registerTask } = api;
  const {
    userConfig: { inlineStyle, compileDependencies, outputDir },
    rootDir,
  } = context;

  const getWebpackBase = getValue(GET_RAX_APP_WEBPACK_CONFIG);
  const baseConfig = getWebpackBase(api, {
    target: 'document',
    babelConfigOptions: { styleSheet: inlineStyle },
    isNode: true,
  });

  baseConfig.plugins.delete('ProgressPlugin');

  baseConfig.target('node');
  baseConfig.output.libraryTarget('commonjs2');
  baseConfig.output.path(path.join(rootDir, outputDir, 'document'));

  // do not copy public
  if (baseConfig.plugins.has('CopyWebpackPlugin')) {
    baseConfig.plugins.delete('CopyWebpackPlugin');
  }

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

    entries.forEach(({ entryName, entryPath }) => {
      config.entry(entryName).add(`${require.resolve('./Loaders/render-loader')}!${entryPath}`);
    });
  });
};
