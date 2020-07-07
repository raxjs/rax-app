const { absoluteModuleResolve } = require('../pathHelper');

module.exports = (config, context) => {
  const { rootDir } = context;
  const appEntry = absoluteModuleResolve(rootDir, './src/app');
  const entryConfig = config.entry('index');

  // Force disable HMR, kraken not support yet.
  config.devServer.inline(false);
  config.devServer.hot(false);

  // Remove hmr entry.
  entryConfig
    .clear()
    .add(appEntry);
};
