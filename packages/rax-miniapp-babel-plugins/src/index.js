module.exports = function({ usingComponents, nativeLifeCycleMap, target, rootDir }) {
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
    ]
  ];
};
