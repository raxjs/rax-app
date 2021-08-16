import * as path from 'path';
import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import setMPAConfig from '@builder/mpa-config';
import * as appHelpers from '@builder/app-helpers';
import setEntry from './setEntry';
import DocumentPlugin from './Plugins/DocumentPlugin';
import { GET_RAX_APP_WEBPACK_CONFIG } from './constants';
import SnapshotPlugin from './Plugins/SnapshotPlugin';
import setRegisterMethod from './utils/setRegisterMethod';
import setLocalBuilder from './setLocalBuilder';
import getAppEntry from './utils/getAppEntry';

const { getMpaEntries } = appHelpers;
export default (api) => {
  const { onGetWebpackConfig, getValue, context, registerTask, registerUserConfig, registerCliOption, modifyUserConfig } = api;

  const getWebpackBase = getValue(GET_RAX_APP_WEBPACK_CONFIG);
  const tempDir = getValue('TEMP_PATH');
  const target = 'web';
  const { userConfig = {}, rootDir } = context;
  const webConfig = userConfig.web || {};
  const documentPath = getAbsolutePath(path.join(rootDir, 'src/document/index'));
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

  if (webConfig.pha) {
    // Modify mpa config must before than set entry, because entry check depends on mpa config
    modifyUserConfig(() => {
      if (!context.userConfig.web) context.userConfig.web = {};
      context.userConfig.web.mpa = true;
      delete context.userConfig.plugins;
      return context.userConfig;
    });
  }

  // Set Entry
  setEntry(chainConfig, context);
  registerTask(target, chainConfig);
  // Set global methods
  setRegisterMethod(api);

  // onGetWebpackConfig((config) => {
  //   const { command } = context;
  //   if (command === 'start') {
  //     setDev(config);
  //   }
  // });

  onGetWebpackConfig(target, (config) => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { rootDir, command } = context;
    const staticConfig = getValue('staticConfig');

    config.plugin('document').use(DocumentPlugin, [
      {
        api,
        staticConfig,
        documentPath,
        pages: webConfig.mpa ? [] : [
          getAppEntry(rootDir),
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

    if (command === 'start') {
      const webEntries = config.entryPoints.entries();
      Object.keys(webEntries).forEach((entryName) => {
        const entrySet = config.entry(entryName);
        const entryFiles = entrySet.values();
        const finalEntryFile = entryFiles[entryFiles.length - 1];
        // Add webpack hot dev client
        entrySet.prepend(require.resolve('react-dev-utils/webpackHotDevClient'));
        // Add module.hot.accept() to entry
        entrySet.add(`${require.resolve('./Loaders/hmr-loader')}!${finalEntryFile}`);
        entrySet.delete(finalEntryFile);
      });
    }
  });

  if (documentPath) {
    setLocalBuilder(api, documentPath);
  } else if (webConfig.staticExport) {
    if (!webConfig.mpa) {
      console.log(chalk.red("SPA doesn't support staticExport!"));
      return;
    }
    setLocalBuilder(api);
  }
};

function getAbsolutePath(filepath: string): string | undefined {
  const targetExt = ['.tsx', '.jsx', '.js'].find((ext) => fs.existsSync(`${filepath}${ext}`));
  if (targetExt) {
    return `${filepath}${targetExt}`;
  }
}
