const fs = require('fs');
const path = require('path');
const buildComponent = require('build-plugin-rax-component');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Treat rax iceworks block as rax component.
module.exports = (api, options = {}) => {
  const { onGetWebpackConfig, context } = api;
  const { command, rootDir } = context;

  // Use ice and rax 'demo/index' file as preview entry.
  const demoDir = path.resolve(rootDir, 'demo');

  if (
    !fs.existsSync(demoDir) ||
    !fs.readdirSync(demoDir).find(file => file.indexOf('index') > -1)
  ) {
    throw new Error('Rax block template need "demo/index" file to debug your block.');
  }

  buildComponent(api, options);

  // Add build/index.html output
  if (command === 'build') {
    onGetWebpackConfig('component-build-web', (config) => {
      config.entry('index').clear().add(path.resolve(demoDir, 'index'));
      config.plugin('html').use(HtmlWebpackPlugin);
      config.externals([]);
    });
  }
};
