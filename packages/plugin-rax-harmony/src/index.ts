import * as path from 'path';
import * as setMPAConfig from '@builder/mpa-config';
import { getMpaEntries } from '@builder/app-helpers';
import setEntry from './setEntry';
import { GET_RAX_APP_WEBPACK_CONFIG } from './constants';
import RequireModulePlugin from './Plugins/RequireModulePlugin';
import addWorkerEntry from './addWorkerEntry';

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

  setEntry(chainConfig, context);

  chainConfig.name(target);

  registerTask(target, chainConfig);

  onGetWebpackConfig(target, (config) => {
    const { harmony = {} } = userConfig;
    const { mpa, appType = 'rich' } = harmony;
    const staticConfig = getValue('staticConfig');
    // set mpa config
    if (mpa) {
      setMPAConfig.default(api, config, {
        targetDir: tempDir,
        type: target,
        entries: getMpaEntries(api, {
          target,
          appJsonContent: staticConfig,
        }),
      });

      addWorkerEntry(config, { rootDir });
    }

    config.output.merge({
      iife: true,
    });
    config.output.devtoolModuleFilenameTemplate('webpack:///[absolute-resource-path]');
    config.devtool('nosources-source-map');

    config.module
      .rule('app-worker')
      .test(/src\/app-worker\.(j|t)s$/)
      .use('app-worker-loader')
      .loader(require.resolve('./Loaders/AppWorkerLoader'))
      .options({
        appType,
        // TODO: transform staticConfig to manifest.json
        // Mock
        manifest: '{"appID":"com.example.ace.helloworld","appName":"HelloAce","versionName":"1.0.0","versionCode":1,"minPlatformVersion":"1.0.1","pages":["pages/index/index","pages/detail/detail"],"window":{"designWidth":750,"autoDesignWidth":false}}',
      });

    config.plugin('RequireModulePlugin').use(RequireModulePlugin, [
      {
        appType,
      },
    ]);

    if (command === 'start') {
      // Add webpack hot dev client
      Object.keys(config.entryPoints.entries()).forEach((entryName) => {
        config.entry(entryName).prepend(require.resolve('react-dev-utils/webpackHotDevClient'));
      });
    }
  });
};
