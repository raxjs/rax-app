const path = require('path');

const { hmrClient } = require('rax-compile-config');

const { WECHAT_MINIPROGRAM, MINIAPP } = require('../constants');


module.exports = (config, context, targert) => {
  const { rootDir, command } = context;
  const isDev = command === 'start';

  // SPA
  const appEntry = path.resolve(rootDir, 'src/app.js');
  const entryConfig = config.entry('index');

  config.module.rule('appJSON')
    .use('loader')
    .tap(() => ({ targert }));


  ['jsx', 'tsx'].forEach(tag => {
    config.module.rule(tag)
      .use('platform')
      .options({
        platform: targert,
      });
  });

  if (isDev && ![WECHAT_MINIPROGRAM, MINIAPP].includes(targert)) {
    entryConfig.add(hmrClient);
  }
  entryConfig.add(appEntry);
};
