const loaderUtils = require('loader-utils');
const { join, extname } = require('path');
const runtimePlugins = require('./plugins/runtime-mode');
const { generate } = require('./codegen');
const { parse } = require('./parser');

module.exports = function(content) {
  const { mode, routes, usingComponents, nativeLifeCycleMap } = loaderUtils.getOptions(this);
  let plugins = [];
  if (!/\/node_modules\//.test(this.resourcePath)) {
    routes.forEach(({ source }) => {
      const ext = extname(this.resourcePath);
      if (join(this.rootContext, 'src', source) === this.resourcePath.replace(ext, '')) {
        nativeLifeCycleMap[this.resourcePath] = {};
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
    resourcePath: this.resourcePath
  });
  const generated = generate(parsed, {
    plugins,
    routes
  });
  return generated.code;
};
