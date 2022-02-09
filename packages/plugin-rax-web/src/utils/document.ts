import * as path from 'path';

// entryName => { document, custom }
const documentMap = {};

export function setDocument(entryName: string, content: string, customDocument: boolean) {
  documentMap[entryName] = {
    document: content,
    custom: customDocument,
  };
}

export function getDocument({ name, source }) {
  let entryName;
  if (name) {
    entryName = name;
  } else {
    const dir = path.dirname(source);
    entryName = path.parse(dir).name.toLocaleLowerCase();
  }
  return documentMap[entryName];
}
