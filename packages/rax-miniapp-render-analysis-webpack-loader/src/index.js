const loaderUtils = require('loader-utils');
const { join } = require('path');
const runtimePlugins = require('./plugins/runtime-mode');
const { generate } = require('./codegen');
const { parse } = require('./parser');
const getFilePath = require('./utils/getFilePath');

module.exports = function(content) {
  const { mode, routes, usingComponents, nativeLifeCycleMap } = loaderUtils.getOptions(this);
  let plugins = [];
  const filePath = getFilePath(this.resourcePath);
  if (nativeLifeCycleMap[filePath]) {
    return content;
  }
  if (!/\/node_modules\//.test(filePath)) {
    routes.forEach(({ source }) => {
      if (join(this.rootContext, 'src', source) === filePath) {
        nativeLifeCycleMap[filePath] = {};
      }
    });
  }
  if (mode === 'runtime') {
    plugins = plugins.concat(runtimePlugins);
  }
  const parsed = parse(content.trim(), {
    plugins,
    routes,
    nativeLifeCycleMap,
    filePath
  });
  const generated = generate(parsed, {
    plugins,
    routes
  });
  return generated.code;
};
