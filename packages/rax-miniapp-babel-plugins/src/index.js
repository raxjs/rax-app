const babel = require('@babel/core');
const { join } = require('path');
const getFilePath = require('./utils/getFilePath');

module.exports = function({ routes, usingComponents, nativeLifeCycleMap }) {
  return [
    require.resolve('./plugins/babel-plugin-remove-Function'),
    require.resolve('./plugins/babel-plugin-external-module'),
    [
      require.resolve('./plugins/babel-plugin-native-lifecycle'),
      {
        nativeLifeCycleMap,
        routes,
      },
    ],
  ];
};
