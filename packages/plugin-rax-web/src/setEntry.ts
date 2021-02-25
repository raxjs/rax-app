import * as path from 'path';
import * as fs from 'fs';

export default (config, context) => {
  const {
    rootDir,
    command,
    userConfig: { web = {} },
  } = context;
  const isDev = command === 'start';

  if (!web.mpa) {
    // SPA
    const appEntry = moduleResolve(formatPath(path.join(rootDir, './src/app')));
    const entryConfig = config.entry('index');

    config.module.rule('appJSON').use('loader');

    if (isDev) {
      entryConfig.add(require.resolve('react-dev-utils/webpackHotDevClient'));
    }
    entryConfig.add(appEntry);
  }
};

function moduleResolve(filePath) {
  const ext = ['.ts', '.js', '.tsx', '.jsx'].find((extension) => fs.existsSync(`${filePath}${extension}`));
  if (!ext) {
    throw new Error(`Cannot find target file ${filePath}.`);
  }
  return require.resolve(`${filePath}${ext}`);
}

function formatPath(pathStr) {
  return process.platform === 'win32' ? pathStr.split(path.sep).join('/') : pathStr;
}
