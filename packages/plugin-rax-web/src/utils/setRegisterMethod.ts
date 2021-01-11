import { injectHTML, insertScriptsByInfo, getInjectedHTML } from './htmlStructure';
import { getDocument } from './document';

export default (api) => {
  const { registerMethod } = api;
  registerMethod('rax.injectHTML', injectHTML);
  registerMethod('rax.insertScriptsByInfo', insertScriptsByInfo);
  registerMethod('rax.getInjectedHTML', getInjectedHTML);
  registerMethod('rax.getDocument', getDocument);
};
