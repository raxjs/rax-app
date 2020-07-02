const { getDepPath } = require('../pathHelper');
const { existsSync } = require('fs-extra');

const EntryLoader = require.resolve('../../../loaders/MiniAppEntryLoader');

module.exports = (config, context, routes) => {
  const { rootDir } = context;

  config.entryPoints.clear();

  routes.forEach(({ entryName, source }) => {
    const entryConfig = config.entry(entryName);

    const pageEntry = getDepPath(rootDir, source);
    entryConfig.add(`${EntryLoader}?${JSON.stringify({ routes })}!${pageEntry}`);
  });

  // Add app entry
  // When using typescript, if not set extension, webpack will load app.json rathen than app.ts
  const appFilePath = getDepPath(rootDir, 'app');
  const appFilePathWithExt = existsSync(`${appFilePath}.ts`) ? `${appFilePath}.ts` : appFilePath;
  config.entry('app').add(appFilePathWithExt);
};

