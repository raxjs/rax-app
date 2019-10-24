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


  ['jsx', 'tsx'].forEach(tag => {
    config.module.rule(tag)
      .use('platform')
      .options({
        platform: type,
      });
  });

  if (isDev) {
    entryConfig.add(hmrClient);
  }
  entryConfig.add(appEntry);
};
