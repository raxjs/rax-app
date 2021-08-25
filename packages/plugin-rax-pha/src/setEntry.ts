import * as path from 'path';

export default ({ context, config, appWorkerPath }) => {
  const { userConfig, rootDir } = context;
  const { outputDir = 'build' } = userConfig;

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
};
