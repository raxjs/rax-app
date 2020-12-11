import * as path from 'path';
import setMPAConfig from '@builder/mpa-config';
import setDev from './setDev';
import setEntry from './setEntry';
import DocumentPlugin from './DocumentPlugin';
import { GET_RAX_APP_WEBPACK_CONFIG } from './constants';
import * as appHelpers from '@builder/app-helpers';

const { getMpaEntries } = appHelpers;
export default (api) => {
  const { onGetWebpackConfig, getValue, context, registerTask, registerUserConfig, registerCliOption } = api;

  const getWebpackBase = getValue(GET_RAX_APP_WEBPACK_CONFIG);
  const tempDir = getValue('TEMP_PATH');
  const target = 'web';
  const { userConfig = {} } = context;
  const chainConfig = getWebpackBase(api, {
    target,
    babelConfigOptions: { styleSheet: userConfig.inlineStyle },
    progressOptions: {
      name: 'Web',
    },
  });
  chainConfig.name(target);
  chainConfig.taskName = target;
  registerUserConfig({
    name: target,
    validation: 'object',
  });

  // Set Entry
  setEntry(chainConfig, context);
  registerTask(target, chainConfig);

  onGetWebpackConfig(target, (config) => {
    const { rootDir, command } = context;
    const { outputDir } = userConfig;
    const webConfig = userConfig.web || {};
    const staticConfig = getValue('staticConfig');

    // Set output dir
    const outputPath = path.resolve(rootDir, outputDir, target);
    config.output.path(outputPath);

    if (command === 'start') {
      setDev(config);
    }

    const webpackConfig = config.toConfig();

    webpackConfig.target = 'node';

    webpackConfig.output.libraryTarget = 'commonjs2';
    // do not generate vendor.js when compile document
    // deep copy webpackConfig optimization, because the toConfig method is shallow copy
    webpackConfig.optimization = {
      ...webpackConfig.optimization,
      splitChunks: {
        ...webpackConfig.optimization.splitChunks,
        cacheGroups: {},
      },
    };

    config.plugin('document').use(DocumentPlugin, [
      {
        context,
        pages: [
          {
            entryName: 'index',
            path: '/',
          },
        ],
        staticExport: webConfig.staticExport,
        webpackConfig,
        staticConfig,
        htmlInfo: {
          title: staticConfig.window && staticConfig.window.title,
          doctype: webConfig.doctype,
        },
      },
    ]);
    if (webConfig.mpa || webConfig.pha) {
      // support --mpa-entry to specify mpa entry
      registerCliOption({
        name: 'mpa-entry',
        commands: ['start'],
      });
      setMPAConfig(config, {
        context,
        type: 'web',
        framework: 'rax',
        targetDir: tempDir,
        entries: getMpaEntries(api, {
          target,
          appJsonPath: path.join(rootDir, 'src/app.json'),
        }),
      });
    }
  });
};
