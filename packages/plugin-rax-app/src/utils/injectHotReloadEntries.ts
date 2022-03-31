import { isWebpack4 } from '@builder/compat-webpack4';

export default function (config) {
  const entries = config.entryPoints.entries();
  Object.keys(entries).forEach((entryName) => {
    const entrySet = config.entry(entryName);
    const entryFiles = entrySet.values();
    const finalEntryFile = entryFiles[entryFiles.length - 1];
    // Add webpack hot dev client for webpack4
    if (isWebpack4) {
      entrySet.prepend(require.resolve('react-dev-utils/webpackHotDevClient'));
    }
    // Add module.hot.accept() to entry
    entrySet.add(`${require.resolve('../Loaders/HmrLoader')}!${finalEntryFile}`);
    entrySet.delete(finalEntryFile);
  });
}
