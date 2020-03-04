const path = require('path');
const fs = require('fs-extra');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { hmrClient } = require('rax-compile-config');

const { WECHAT_MINIPROGRAM, MINIAPP } = require('../constants');


module.exports = (config, context, target) => {
  const { rootDir, command } = context;
  const isDev = command === 'start';

  // SPA
  const appEntry = path.resolve(rootDir, 'src/app.js');
  const entryConfig = config.entry('index');

  config.module.rule('appJSON')
    .use('loader')
    .tap(() => ({ type: target }));


  ['jsx', 'tsx'].forEach(tag => {
    config.module.rule(tag)
      .use('platform')
      .options({
        platform: target,
      });
  });

  if (fs.existsSync(path.resolve(rootDir, 'src/public'))) {
    config.plugin('copyWebpackPlugin')
      .use(CopyWebpackPlugin, [[{ from: 'src/public', to: `${target}/public` }]]);
  }

  if (isDev && ![WECHAT_MINIPROGRAM, MINIAPP].includes(target)) {
    entryConfig.add(hmrClient);
  }
  entryConfig.add(appEntry);
};
