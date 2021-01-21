import * as path from 'path';

export default function (staticConfig) {
  const map = {};
  staticConfig?.routes.forEach(({ path: pathname, source, name, window }) => {
    let entryName;

    if (name) {
      entryName = name;
    } else if (source) {
      entryName = path.parse(path.dirname(source)).name.toLocaleLowerCase();
    }

    if (entryName) {
      map[entryName] = {
        path: pathname,
        title: window?.title || staticConfig?.window?.title,
      };
    }
  });
  return map;
}
