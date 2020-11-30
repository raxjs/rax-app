const path = require('path');
const fs = require('fs-extra');

module.exports = ({ context, config }) => {
  const { userConfig, rootDir } = context;
  const { outputDir = 'build' } = userConfig;
  const fileExtensions = ['.js', '.ts'];

  fileExtensions.forEach((fileExtension) => {
    const appWorkerPath = path.resolve(rootDir, 'src/pha-worker' + fileExtension);
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
  });
};
