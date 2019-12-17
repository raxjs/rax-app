const path = require('path');
const EntryLoader = require.resolve('../../../loaders/KboneEntryLoader');

function getDepPath(rootDir, com) {
  if (com[0] === '/') {
    return path.join(rootDir, 'src', com);
  } else {
    return path.resolve(rootDir, 'src', com);
  }
};

module.exports = (config, context, entries) => {
  const { rootDir } = context;

  config.entryPoints.clear();

  entries.forEach(({ entryName, source }) => {
    const entryConfig = config.entry(entryName);

    const pageEntry = getDepPath(rootDir, source);
    entryConfig.add(`${EntryLoader}!${pageEntry}`);
  });
};
