const path = require('path');
const buildComponent = require('build-plugin-rax-component');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Treat rax iceworks block as rax component.
module.exports = (api, options = {}) => {
  const { onGetWebpackConfig, context } = api;
  const { command, rootDir } = context;

  buildComponent(api, options);

  // Add build/index.html output
  if (command === 'build') {
    onGetWebpackConfig('component-build-web', (config) => {
      config.entry('index').clear().add(path.resolve(rootDir, 'demo/index'));
      config.plugin('html').use(HtmlWebpackPlugin);
      config.externals([]);
    });
  }
};