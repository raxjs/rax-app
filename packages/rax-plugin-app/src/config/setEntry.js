const path = require('path');

const { hmrClient } = require('rax-compile-config');


module.exports = (config, context, type) => {
  const { rootDir, command } = context;
  const isDev = command === 'dev';

  // SPA
  const appEntry = path.resolve(rootDir, 'src/app.js');
  const entryConfig = config.entry('index');

  config.module.rule('appJSON')
    .use('loader')
    .tap(() => ({ type }));

  if (isDev) {
    entryConfig.add(hmrClient);
  }
  entryConfig.add(appEntry);
};
