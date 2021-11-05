const { merge } = require('webpack-merge');

module.exports = function (config, libs) {
  const extractLibs = [
    {
      libraryName: '@alifd/meet',
      dir: 'es',
    },
    {
      libraryName: '@alifd/meet-react',
      dir: 'es',
    },
    ...libs,
  ];

  // notice: in babel 7+
  const importConfigs = extractLibs.map((lib) => {
    const { libraryName, dir = 'es' } = lib;

    return [
      require.resolve('babel-plugin-import'),
      {
        libraryName,
        libraryDirectory: dir,
      },
      libraryName,
    ];
  });

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
