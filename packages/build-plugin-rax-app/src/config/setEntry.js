const { absoluteModuleResolve } = require('./pathHelper');

const { hmrClient } = require('rax-compile-config');

const { WECHAT_MINIPROGRAM, MINIAPP, QUICKAPP } = require('../constants');


module.exports = (config, context, entryPath, target) => {
  const { rootDir, command } = context;
  const isDev = command === 'start';

  // SPA
  const appEntry = absoluteModuleResolve(rootDir, `./${entryPath}`);
  const entryConfig = config.entry('index');

  config.module.rule('appJSON')
    .use('loader')
    .tap(() => ({ type: target, entryPath }));


  ['jsx', 'tsx'].forEach(tag => {
    config.module.rule(tag)
      .use('platform')
      .options({
        platform: target,
      });
  });

  if (isDev && ![WECHAT_MINIPROGRAM, MINIAPP, QUICKAPP].includes(target)) {
    entryConfig.add(hmrClient);
  }
  entryConfig.add(appEntry);
};
