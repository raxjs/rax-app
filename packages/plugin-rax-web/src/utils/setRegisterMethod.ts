import { insertLinks, insertMetas, insertScripts } from './htmlStructure';
export default (api) => {
  const { registerMethod } = api;
  registerMethod('ininsertLinks', insertLinks);
  registerMethod('insertMetas', insertMetas);
  registerMethod('insertScripts', insertScripts);
};
