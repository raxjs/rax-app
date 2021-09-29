import { IGetBuiltInPlugins, IPluginList, Json, IUserConfig } from 'build-scripts';
import * as miniappBuilderShared from 'miniapp-builder-shared';
import { init } from '@builder/pack/deps/webpack/webpack';
import { hijackWebpack } from './require-hook';

const { constants: { MINIAPP, WECHAT_MINIPROGRAM, BYTEDANCE_MICROAPP, BAIDU_SMARTPROGRAM, KUAISHOU_MINIPROGRAM } } = miniappBuilderShared;
const miniappPlatforms = [MINIAPP, WECHAT_MINIPROGRAM, BYTEDANCE_MICROAPP, BAIDU_SMARTPROGRAM, KUAISHOU_MINIPROGRAM];

interface IRaxAppUserConfig extends IUserConfig {
  targets: string[];
  store?: boolean;
  web?: any;
}

const getBuiltInPlugins: IGetBuiltInPlugins = (userConfig: IRaxAppUserConfig) => {
  const { targets = ['web'], store = true, router = true, webpack5 } = userConfig;
  const coreOptions: Json = {
    framework: 'rax',
    alias: 'rax-app',
  };

  init(webpack5);
  hijackWebpack(webpack5);

  // built-in plugins for rax app
  const builtInPlugins: IPluginList = [
    ['build-plugin-app-core', coreOptions],
    'build-plugin-rax-app',
    'build-plugin-ice-config',
  ];

  if (store) {
    builtInPlugins.push('build-plugin-rax-store');
  }

  if (targets.includes('web')) {
    builtInPlugins.push('build-plugin-rax-web');
    if (userConfig.web) {
      if (userConfig.web.ssr) {
        builtInPlugins.push('build-plugin-ssr');
      }
      if (userConfig.web.pha) {
        builtInPlugins.push('build-plugin-rax-pha');
      }
    }
  }

  if (targets.includes('weex')) {
    builtInPlugins.push('build-plugin-rax-weex');
  }

  if (targets.includes('kraken')) {
    builtInPlugins.push('build-plugin-rax-kraken');
  }
  if (targets.some((target) => miniappPlatforms.includes(target))) {
    builtInPlugins.push('build-plugin-rax-miniapp');
  }

  if (router) {
    builtInPlugins.push('build-plugin-rax-router');
  }

  builtInPlugins.push('build-plugin-ice-logger');

  return builtInPlugins;
};

export = getBuiltInPlugins;
