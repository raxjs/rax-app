const { merge } = require('webpack-merge');

module.exports = function (config) {
  // notice: in babel 7+
  const importConfigs = [
    [
      require.resolve('babel-plugin-import'),
      {
        libraryName: '@alifd/meet',
        libraryDirectory: 'es',
      },
      'meet',
    ],
    [
      require.resolve('babel-plugin-import'),
      {
        libraryName: '@alifd/meet-react',
        libraryDirectory: 'es',
      },
      'meet-react',
    ],
  ];

  ['tsx', 'jsx'].forEach((rule) => {
    config.module
      .rule(rule)
      .use('babel-loader')
      .tap((opts) => {
        return merge(opts, {
          plugins: [...importConfigs],
        });
      });
  });
};
