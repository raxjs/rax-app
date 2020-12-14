const path = require('path');
const fs = require('fs-extra');
const { formatPath } = require('@builder/app-helpers');

module.exports = ({ context, config }) => {
  const { userConfig, rootDir } = context;
  const { outputDir = 'build' } = userConfig;

  const appWorkerPath = moduleResolve(formatPath(path.join(rootDir, './src/pha-worker')));
  if (fs.pathExistsSync(appWorkerPath)) {
    config
      .entry('pha-worker')
      .add(appWorkerPath)
      .end()
      .output.path(path.resolve(rootDir, outputDir, 'web'))
      .libraryTarget('umd')
      .globalObject('this')
      .end()
      .devServer.inline(false)
      .hot(false);
  }
};

function moduleResolve(filePath) {
  const ext = ['.ts', '.js'].find((extension) => fs.existsSync(`${filePath}${extension}`));
  if (!ext) {
    throw new Error(`Cannot find target file ${filePath}.`);
  }
  return require.resolve(`${filePath}${ext}`);
}
