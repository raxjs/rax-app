module.exports = function({ usingComponents, nativeLifeCycleMap, target, rootDir, usingPlugins }) {
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
      require.resolve('./plugins/babel-plugin-handle-custom-component'),
      {
        usingComponents,
        target,
        rootDir
      }
    ],
    [
      require.resolve('./plugins/babel-plugin-handle-miniapp-plugin'),
      {
        usingPlugins
      }
    ],

  ];
};
