export default function (config) {
  const entries = config.entryPoints.entries();
  Object.keys(entries).forEach((entryName) => {
    const entrySet = config.entry(entryName);
    const entryFiles = entrySet.values();
    const finalEntryFile = entryFiles[entryFiles.length - 1];
    // Add webpack hot dev client
    entrySet.prepend(require.resolve('react-dev-utils/webpackHotDevClient'));
    // Add module.hot.accept() to entry
    entrySet.add(`${require.resolve('../Loaders/HmrLoader')}!${finalEntryFile}`);
    entrySet.delete(finalEntryFile);
  });
}
