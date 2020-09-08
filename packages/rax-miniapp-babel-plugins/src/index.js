module.exports = function({ usingComponents, nativeLifeCycleMap, target, rootDir, usingPlugins, runtimeDependencies, staticTmpls }) {
  const plugins = [
    require.resolve('./plugins/babel-plugin-remove-Function'),
    require.resolve('./plugins/babel-plugin-external-module'),
    [
      require.resolve('./plugins/babel-plugin-native-lifecycle'),
      {
        nativeLifeCycleMap,
      },
    ],
    [
      require.resolve('./plugins/babel-plugin-handle-native-component'),
      {
        usingComponents,
        target,
        rootDir,
        runtimeDependencies
      }
    ],
    [
      require.resolve('./plugins/babel-plugin-handle-plugin-component'),
      {
        usingPlugins
      }
    ],
    [
      require.resolve('./plugins/babel-plugin-static'),
      {
        staticTmpls
      }
    ]
  ];

  return plugins;
};
