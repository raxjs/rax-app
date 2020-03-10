const path = require('path');

const EntryLoader = require.resolve('../../../loaders/MiniAppEntryLoader');

function getDepPath(rootDir, com) {
  if (com[0] === path.sep ) {
    return path.join(rootDir, 'src', com);
  } else {
    return path.resolve(rootDir, 'src', com);
  }
};

module.exports = (config, context, routes) => {
  const { rootDir } = context;

  config.entryPoints.clear();

  routes.forEach(({ entryName, source }) => {
    const entryConfig = config.entry(entryName);

    const pageEntry = getDepPath(rootDir, source);
    entryConfig.add(`${EntryLoader}?${JSON.stringify({ routes })}!${pageEntry}`);
  });
};

