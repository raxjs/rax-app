import * as path from 'path';

// entryName => document
const documentMap = {};

export function setDocument(entryName, content) {
  documentMap[entryName] = content;
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
