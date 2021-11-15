import { processAssets, emitAsset } from '@builder/compat-webpack4';
import * as webpackSources from 'webpack-sources';
import * as webpack from 'webpack';
import { IRequireModulePluginOptions } from '../types';
import { DEVICE_LEVEL } from '../constants';

const PLUGIN_NAME = 'RequireModulePlugin';
const { RawSource } = webpack.sources || webpackSources;

const methodForLite =
`
function requireModule(moduleName) {
  return requireNative(moduleName.slice(1));
}
`;
const methodForOthers =
`
let $app_require$;

function requireModule(moduleName) {
  const systemList = ['system.router', 'system.app', 'system.prompt', 'system.configuration',
  'system.image', 'system.device', 'system.mediaquery', 'ohos.animator', 'system.grid', 'system.resource']
  var target = ''
  if (systemList.includes(moduleName.replace('@', ''))) {
    target = $app_require$('@app-module/' + moduleName.substring(1));
    return target;
  }
  var shortName = moduleName.replace(/@[^.]+\.([^.]+)/, '$1');
  target = requireNapi(shortName);
  if (target !== 'undefined' && /@ohos/.test(moduleName)) {
    return target;
  }
  if (typeof ohosplugin !== 'undefined' && /@ohos/.test(moduleName)) {
    target = ohosplugin;
    for (let key of shortName.split('.')) {
      target = target[key];
      if(!target) {
        break;
      }
    }
    if (typeof target !== 'undefined') {
      return target;
    }
  }
  if (typeof systemplugin !== 'undefined') {
    target = systemplugin;
    for (let key of shortName.split('.')) {
      target = target[key];
      if(!target) {
        break;
      }
    }
    if (typeof target !== 'undefined') {
      return target;
    }
  }
  return target;
}
`;

export default class RequireModulePlugin {
  options: IRequireModulePluginOptions = {
    appType: 'rich',
  };
  constructor(options: IRequireModulePluginOptions) {
    this.options = options;
  }
  apply(compiler) {
    processAssets({
      pluginName: PLUGIN_NAME,
      compiler,
    }, ({ assets, callback, compilation }) => {
      const requireMethod = this.options.appType === DEVICE_LEVEL.LITE ? methodForLite : methodForOthers;
      Object.keys(assets)
        .filter((filename) => /\.js$/.test(filename))
        .forEach((filename) => {
          const originalContent = assets[filename].source?.();
          delete assets[filename];
          emitAsset(compilation, filename, new RawSource(`${requireMethod}\n${originalContent}`));
        });
      callback();
    });
  }
}
