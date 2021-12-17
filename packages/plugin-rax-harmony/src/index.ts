import * as setMPAConfig from '@builder/mpa-config';
import { getMpaEntries } from '@builder/app-helpers';
import { GET_RAX_APP_WEBPACK_CONFIG } from './constants';
import BundleShellPlugin from './BundleShellPlugin';
import addWorkerEntry from './addWorkerEntry';
import type { IBundleShellPluginOptions } from './types';
import getManifest from './utils/getManifest';
import setupAppEntry from './setupAppEntry';

const PROJECT_PATH = '/Users/fushen/Documents/workplace/harmony_example/entry/src/main/js/default';

/*
TODO:
- 鸿蒙应用 vendors 为 false，不可配置
 */

export default (api) => {
  const { getValue, context, registerTask, onGetWebpackConfig } = api;
  const { userConfig, rootDir } = context;

  const getWebpackBase = getValue(GET_RAX_APP_WEBPACK_CONFIG);
  const tempDir = getValue('TEMP_PATH');
  const target = 'harmony';
  const chainConfig = getWebpackBase(api, {
    target: 'harmony',
    babelConfigOptions: { styleSheet: true },
    progressOptions: {
      name: 'Harmony',
    },
  });

  let entries = [setupAppEntry(chainConfig, context)];

  chainConfig.name(target);

  registerTask(target, chainConfig);

  onGetWebpackConfig(target, (config) => {
    const { harmony = {} } = userConfig;
    const { mpa, appType = 'rich' } = harmony;
    const staticConfig = getValue('staticConfig');

    config.target('node');

    config.output.path(PROJECT_PATH);
    config.devServer.hot(false);

    // set mpa config
    if (mpa) {
      entries = getMpaEntries(api, {
        target,
        appJsonContent: staticConfig,
      });

      setMPAConfig.default(api, config, {
        targetDir: tempDir,
        type: target,
        entries,
      });
    }

    addWorkerEntry(config, { rootDir });

    const bundleShellPluginOptions: IBundleShellPluginOptions = {
      appType,
      manifest: getManifest(entries, { staticConfig, nativeConfig: harmony.nativeConfig }),
    };

    config.plugin('BundleShellPlugin').use(BundleShellPlugin, [bundleShellPluginOptions]);
  });
};
