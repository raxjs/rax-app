const path = require('path');
const { isWebpack4 } = require('@builder/compat-webpack4');

module.exports = ({ context, config, appWorkerPath }) => {
  const { userConfig, rootDir } = context;
  const { outputDir = 'build' } = userConfig;

  config
    .entry('pha-worker')
    .add(appWorkerPath)
    .end()
    .output.path(path.resolve(rootDir, outputDir, 'web'))
    .libraryTarget('umd')
    .globalObject('this');
};
