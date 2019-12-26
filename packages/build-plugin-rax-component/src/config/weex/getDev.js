const path = require('path');
const { hmrClient } = require('rax-compile-config');
const WeexFrameworkBanner = require('../../plugins/WeexFrameworkBannerPlugin');
const getBaseWebpack = require('../getBaseWebpack');
const getDemos = require('../getDemos');

module.exports = (context) => {
  const config = getBaseWebpack(context);

  const { rootDir } = context;

  getDemos(rootDir).forEach(({ name, filePath }) => {
    config.entry(name)
      .add(hmrClient)
      .add(filePath);
  });

  config.output
    .filename('weex/[name].js');

  config.plugin('weexFrame')
    .use(WeexFrameworkBanner);

  config.module.rule('css')
    .test(/\.css?$/)
    .use('css')
    .loader(require.resolve('stylesheet-loader'));

  config.module.rule('less')
    .test(/\.less?$/)
    .use('css')
    .loader(require.resolve('stylesheet-loader'))
    .end()
    .use('less')
    .loader(require.resolve('less-loader'));

  return config;
};
