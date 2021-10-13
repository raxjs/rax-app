import { IGetBuiltInPlugins, IPluginList, Json, IUserConfig } from '@alib/build-scripts';
import * as miniappBuilderShared from 'miniapp-builder-shared';

const { constants: { MINIAPP, WECHAT_MINIPROGRAM, BYTEDANCE_MICROAPP, BAIDU_SMARTPROGRAM, KUAISHOU_MINIPROGRAM } } = miniappBuilderShared;
const miniappPlatforms = [MINIAPP, WECHAT_MINIPROGRAM, BYTEDANCE_MICROAPP, BAIDU_SMARTPROGRAM, KUAISHOU_MINIPROGRAM];

interface IRaxAppUserConfig extends IUserConfig {
  targets: string[];
  store?: boolean;
  web?: any;
}

const getBuiltInPlugins: IGetBuiltInPlugins = (userConfig: IRaxAppUserConfig) => {
  const { targets = ['web'], store = true } = userConfig;
  const coreOptions: Json = {
    framework: 'rax',
    alias: 'rax-app',
  };

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

  const isMiniAppTargeted = targets.some((target) => miniappPlatforms.includes(target));

  if (isMiniAppTargeted) {
    builtInPlugins.push('build-plugin-rax-miniapp');
  }

  builtInPlugins.push([
    'build-plugin-minify-classname',
    { miniapp: isMiniAppTargeted },
  ]);

  return builtInPlugins;
};

export = getBuiltInPlugins;
