const path = require('path');
const fs = require('fs-extra');

module.exports = (context, config, type) => {
  const { userConfig, rootDir } = context;
  const { outputDir = 'build' } = userConfig;

  const appWorkerPath = path.resolve(rootDir, 'src/pha-worker' + (type === 'ts' ? '.ts' : '.js'));
  if (fs.pathExistsSync(appWorkerPath)) {
    config
      .entry('pha-worker')
      .add(appWorkerPath)
      .end()
      .output
      .path(path.resolve(rootDir, outputDir, 'web'))
      .filename('[name].js')
      .libraryTarget('umd')
      .globalObject('this')
      .end()
      .devServer
      .inline(false)
      .hot(false);
  }
};
