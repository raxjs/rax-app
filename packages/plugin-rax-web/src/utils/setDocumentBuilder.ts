import { getMpaEntries } from '@builder/app-helpers';
import * as path from 'path';
import RenderLoader from '../Loaders/render-loader';
import { GET_RAX_APP_WEBPACK_CONFIG } from '../constants';

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
  });

  baseConfig.plugins.delete('ProgressPlugin');

  baseConfig.target('node');
  baseConfig.output.libraryTarget('commonjs2');
  baseConfig.output.path(path.join(rootDir, outputDir, 'web'));

  // do not copy public
  if (baseConfig.plugins.has('CopyWebpackPlugin')) {
    baseConfig.plugins.delete('CopyWebpackPlugin');
  }

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
      config.entry(entryName).add(`${RenderLoader}!${entryPath}`);
    });
  });
};
