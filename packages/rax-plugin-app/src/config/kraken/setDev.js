const path = require('path');

module.exports = (config, context) => {
  const { rootDir, command } = context;
  const appEntry = path.resolve(rootDir, 'src/app.js');
  const entryConfig = config.entry('index');

  // Force disable HMR, kraken not support yet.
  config.devServer.inline(false);
  config.devServer.hot(false);

  // Remove hmr entry.
  entryConfig
    .clear()
    .add(appEntry);
};
