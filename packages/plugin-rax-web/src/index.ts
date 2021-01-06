import * as path from 'path';
import setMPAConfig from '@builder/mpa-config';
import * as appHelpers from '@builder/app-helpers';
import setDev from './setDev';
import setEntry from './setEntry';
import DocumentPlugin from './DocumentPlugin';
import { GET_RAX_APP_WEBPACK_CONFIG } from './constants';
import SnapshotPlugin from './SnapshotPlugin';
import setRegisterMethod from './utils/setRegisterMethod';

const { getMpaEntries } = appHelpers;
export default (api) => {
  const { onGetWebpackConfig, getValue, context, registerTask, registerUserConfig, registerCliOption, modifyUserConfig } = api;

  const getWebpackBase = getValue(GET_RAX_APP_WEBPACK_CONFIG);
  const tempDir = getValue('TEMP_PATH');
  const target = 'web';
  const { userConfig = {} } = context;
  const webConfig = userConfig.web || {};
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
  // Set global methods
  setRegisterMethod(api);

  if (webConfig.pha) {
    // Modify mpa config
    modifyUserConfig(() => {
      if (!context.userConfig.web) context.userConfig.web = {};
      context.userConfig.web.mpa = true;
      return context.userConfig;
    });
  }

  onGetWebpackConfig(target, (config) => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { rootDir, command, userConfig } = context;
    const { outputDir } = userConfig;
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
    if (webConfig.snapshot) {
      config.plugin('SnapshotPlugin').use(SnapshotPlugin, [
        {
          withSSR: webConfig.ssr,
        },
      ]);
    }

    if (webConfig.mpa || webConfig.pha) {
      // support --mpa-entry to specify mpa entry
      registerCliOption({
        name: 'mpa-entry',
        commands: ['start'],
      });
      setMPAConfig(api, config, {
        type: 'web',
        framework: 'rax',
        targetDir: tempDir,
        entries: getMpaEntries(api, {
          target,
          appJsonContent: staticConfig,
        }),
      });
    }
  });
};
