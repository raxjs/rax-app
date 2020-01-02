module.exports = (api) => {
  const { onGetWebpackConfig } = api;

  onGetWebpackConfig((config) => {
    config.module
      .rule('css')
      .test(/\.css?$/)
      .use('css')
      .loader(require.resolve('stylesheet-loader'))
      .options({
        theme: true,
      });

    config.module
      .rule('less')
      .test(/\.less?$/)
      .use('css')
      .loader(require.resolve('stylesheet-loader'))
      .end()
      .use('less')
      .loader(require.resolve('less-loader'))
      .options({
        theme: true,
      });
  });
};
