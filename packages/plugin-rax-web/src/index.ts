import * as path from 'path';
import * as chalk from 'chalk';
import setMPAConfig from '@builder/mpa-config';
import * as appHelpers from '@builder/app-helpers';
import setDev from './setDev';
import setEntry from './setEntry';
import DocumentPlugin from './Plugins/DocumentPlugin';
import { GET_RAX_APP_WEBPACK_CONFIG } from './constants';
import SnapshotPlugin from './SnapshotPlugin';
import setRegisterMethod from './utils/setRegisterMethod';
import setLocalBuilder from './setLocalBuilder';

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
      delete context.userConfig.plugins;
      return context.userConfig;
    });
  }

  if (webConfig.staticExport) {
    if (!webConfig.mpa) {
      console.log(chalk.red("SPA doesn't support staticExport!"));
      return;
    }
    setLocalBuilder(api);
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

    config.plugin('document').use(DocumentPlugin, [
      {
        api,
        staticConfig,
        pages: [
          {
            entryName: 'index',
            path: '/',
          },
        ],
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
