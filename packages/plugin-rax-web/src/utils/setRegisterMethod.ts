import { injectHTML, insertScriptsByInfo, getInjectedHTML } from './htmlStructure';
import { getDocument } from './document';

export default (api) => {
  const { registerMethod } = api;
  registerMethod('RAX_INJECT_HTML', injectHTML);
  registerMethod('RAX_INSERT_SCRIPTS_BY_INFO', insertScriptsByInfo);
  registerMethod('RAX_GET_INJECTED_HTML', getInjectedHTML);
  registerMethod('RAX_GET_DOCUMENT', getDocument);
};
