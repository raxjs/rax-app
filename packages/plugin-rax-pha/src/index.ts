import * as path from 'path';
import * as fs from 'fs-extra';
import { formatPath } from '@builder/app-helpers';
import setEntry from './setEntry';
import AppToManifestPlugin from './plugins/AppToManifestPlugin';
import setRegisterMethod from './setRegisterMethod';

import type * as Config from 'webpack-chain';

interface IApi {
  onGetWebpackConfig: (rule: string, callback: (config: Config) => void) => void;
  context: { [key: string]: any };
  registerTask: (taskName: string, callback: (config: Config) => void) => void;
  getValue: (key: string | number) => any;
}

const moduleResolve = (filePath: string) => {
  const extension = ['.ts', '.js'].find((ext) => fs.existsSync(`${filePath}${ext}`));

  if (!extension) {
    return false;
  }

  return require.resolve(`${filePath}${extension}`);
};

export default (api: IApi) => {
  const { context, onGetWebpackConfig, getValue, registerTask } = api;
  const { rootDir } = context;

  const appWorkerPath = moduleResolve(formatPath(path.join(rootDir, 'src', 'pha-worker')));

  onGetWebpackConfig('web', (config) => {
    config.plugin('AppToManifestPlugin').use(AppToManifestPlugin, [
      {
        api,
        appWorkerPath,
      },
    ]);
  });

  // set an api to get dev url before app worker path checking
  setRegisterMethod(api);

  if (!appWorkerPath) {
    return;
  }

  const target = 'PHA';
  const getWebpackBase = getValue('getRaxAppWebpackConfig');
  const configChain = getWebpackBase(api, {
    target,
    progressOptions: {
      name: target,
    },
  });

  configChain.name(target);

  registerTask(target, configChain);

  onGetWebpackConfig(target, (config) => {
    setEntry({
      context,
      config,
      appWorkerPath,
    });

    // do not copy public
    if (config.plugins.has('CopyWebpackPlugin')) {
      config.plugin('CopyWebpackPlugin').tap(() => {
        return [[]];
      });
    }
  });
};
