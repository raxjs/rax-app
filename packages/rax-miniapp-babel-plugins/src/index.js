module.exports = function({ usingComponents, nativeLifeCycleMap, target, rootDir, usingPlugins, dualEngine }) {
  return [
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
        dualEngine
      }
    ],
    [
      require.resolve('./plugins/babel-plugin-handle-plugin-component'),
      {
        usingPlugins
      }
    ],

  ];
};
