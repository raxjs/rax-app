import * as path from 'path';
import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import setMPAConfig from '@builder/mpa-config';
import * as appHelpers from '@builder/app-helpers';
import setEntry from './setEntry';
import setDev from './setDev';
import DocumentPlugin from './Plugins/DocumentPlugin';
import { GET_RAX_APP_WEBPACK_CONFIG } from './constants';
import SnapshotPlugin from './Plugins/SnapshotPlugin';
import setRegisterMethod from './utils/setRegisterMethod';
import setLocalBuilder from './setLocalBuilder';
import getAppEntry from './utils/getAppEntry';

const { getMpaEntries } = appHelpers;
export default (api) => {
  const { onGetWebpackConfig, getValue, context, registerTask, registerCliOption, applyMethod, onHook } = api;

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

  // Set Entry
  setEntry(chainConfig, context);
  registerTask(target, chainConfig);
  // Set global methods
  setRegisterMethod(api);

  onGetWebpackConfig((config) => {
    const { command } = context;
    if (command === 'start') {
      setDev(config);
    }
  });

  // Web entries
  let entries = [getAppEntry(rootDir)];

  onGetWebpackConfig(target, (config) => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { command } = context;
    const staticConfig = getValue('staticConfig');

    config.plugin('document').use(DocumentPlugin, [
      {
        api,
        staticConfig,
        documentPath,
        pages: webConfig.mpa ? [] : entries,
        target
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
      entries = getMpaEntries(api, {
        target,
        appJsonContent: staticConfig,
      });
      // support --mpa-entry to specify mpa entry
      registerCliOption({
        name: 'mpa-entry',
        commands: ['start'],
      });
      setMPAConfig(api, config, {
        type: 'web',
        framework: 'rax',
        targetDir: tempDir,
        entries,
      });
    }

    if (command === 'start') {
      applyMethod('rax.injectHotReloadEntries', config);
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

  // Remove comment node
  let webBuildDir;

  onHook('before.build.run', ({ config: configs }) => {
    const config = configs.find((configItem) => configItem.name === 'web');
    webBuildDir = config.output.path;
  });

  onHook('after.build.compile', () => {
    entries.forEach(({ entryName }) => {
      const htmlFilePath = path.join(webBuildDir, `${entryName}.html`);
      if (fs.existsSync(htmlFilePath)) {
        const html = fs.readFileSync(htmlFilePath, 'utf-8');
        fs.writeFileSync(htmlFilePath, html.replace(/(\<\!--__INNER_ROOT__--\>|\<\!--__BEFORE_ROOT__--\>|\<\!--__AFTER_ROOT__--\>)/g, ''));
      }
    });
  });
};

function getAbsolutePath(filepath: string): string | undefined {
  const targetExt = ['.tsx', '.jsx', '.js'].find((ext) => fs.existsSync(`${filepath}${ext}`));
  if (targetExt) {
    return `${filepath}${targetExt}`;
  }
}
