import { IPluginAPI } from 'build-scripts';
import injectHotReloadEntries from '../utils/injectHotReloadEntries';

export default (api: IPluginAPI) => {
  const { registerMethod, setValue, getValue } = api;

  registerMethod('rax.modifyStaticConfig', (callback) => {
    const staticConfig = getValue('staticConfig');
    setValue('staticConfig', callback(staticConfig));
  });

  registerMethod('rax.injectHotReloadEntries', injectHotReloadEntries);
};
