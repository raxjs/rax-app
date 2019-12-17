const path = require('path');
const { hmrClient } = require('rax-compile-config');
const WeexFrameworkBanner = require('../../plugins/WeexFrameworkBannerPlugin');
const getBaseWebpack = require('../getBaseWebpack');

module.exports = (context) => {
  const config = getBaseWebpack(context);

  const { rootDir } = context;

  config.entry('index')
    .add(hmrClient)
    .add(path.resolve(rootDir, 'demo/index'));

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
