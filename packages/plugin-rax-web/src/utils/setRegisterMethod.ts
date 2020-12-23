import { injectHTML, insertScriptsByInfo, getInjectedHTML } from './htmlStructure';

export default (api) => {
  const { registerMethod } = api;
  registerMethod('injectHTML', injectHTML);
  registerMethod('insertScriptsByInfo', insertScriptsByInfo);
  registerMethod('getInjectedHTML', getInjectedHTML);
};
