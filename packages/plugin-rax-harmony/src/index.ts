import * as setMPAConfig from '@builder/mpa-config';
import { getMpaEntries } from '@builder/app-helpers';
import setEntry from './setupAppEntry';
import { GET_RAX_APP_WEBPACK_CONFIG } from './constants';
import BundleShellPlugin from './BundleShellPlugin';
import addWorkerEntry from './addWorkerEntry';
import type { IBundleShellPluginOptions } from './types';
import { isWebpack4 } from '@builder/compat-webpack4';
import getManifest from './utils/getManifest';
import setupAppEntry from './setupAppEntry';

/*
TODO:
- 鸿蒙应用 vendors 为 false，不可配置
 */

export default (api) => {
  const { getValue, context, registerTask, onGetWebpackConfig } = api;
  const { userConfig, command, rootDir } = context;

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

    // base config
    if (isWebpack4) {
      config.output.libraryTarget('var');
      config.output.libraryExport('result');
    } else {
      config.output.merge({
        library: {
          name: 'result',
          type: 'var',
        },
      });
    }

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

    config.output.devtoolModuleFilenameTemplate('webpack:///[absolute-resource-path]');
    config.devtool('nosources-source-map');

    const bundleShellPluginOptions: IBundleShellPluginOptions = {
      appType,
      manifest: getManifest(entries, { staticConfig, nativeConfig: harmony.nativeConfig }),
    };

    config.plugin('BundleShellPlugin').use(BundleShellPlugin, [bundleShellPluginOptions]);

    if (command === 'start') {
      // Add webpack hot dev client
      Object.keys(config.entryPoints.entries()).forEach((entryName) => {
        config.entry(entryName).prepend(require.resolve('react-dev-utils/webpackHotDevClient'));
      });
    }
  });
};
