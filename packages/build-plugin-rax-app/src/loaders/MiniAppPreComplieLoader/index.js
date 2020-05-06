const babel = require('@babel/core');
const loaderUtils = require('loader-utils');
const { join } = require('path');
const getFilePath = require('./getFilePath');

module.exports = function(content) {
  const { routes, usingComponents, nativeLifeCycleMap, handledPages } = loaderUtils.getOptions(this);
  const filePath = getFilePath(this.resourcePath);

  const cachedPage = handledPages.find(({ path }) => path === filePath);

  if (cachedPage) {
    // Return prev handled result
    return cachedPage.code;
  }

  if (!/\/node_modules\//.test(filePath)) {
    routes.forEach(({ source }) => {
      if (join(this.rootContext, 'src', source) === filePath) {
        if (!nativeLifeCycleMap[filePath]) {
          nativeLifeCycleMap[filePath] = {};
        }
      }
    });
  }
  const isPageFile = !!nativeLifeCycleMap[filePath];

  const parserOpts = {
    plugins: [
      'classProperties',
      'jsx',
      'typescript',
      'trailingFunctionCommas',
      'asyncFunctions',
      'exponentiationOperator',
      'asyncGenerators',
      'objectRestSpread',
      ['decorators', { decoratorsBeforeExport: false }],
      'dynamicImport',
    ], // Support all plugins
  };

  const plugins = [
    require('./babel-plugin-remove-Function'),
    require('./babel-plugin-external-module')
  ];

  if (isPageFile) {
    plugins.push([
      require('./babel-plugin-native-lifecycle'), {
        nativeLifeCycle: nativeLifeCycleMap[filePath],
        code: content
      }
    ]);
  }


  const { code } = babel.transformSync(content, {
    plugins,
    parserOpts: parserOpts
  });

  if (isPageFile) {
    handledPages.push({
      path: filePath,
      code
    });
  }

  return code;
};
