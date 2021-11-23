import * as path from 'path';
import getFilePath from './utils/getFilePath';

export default (config, context) => {
  const {
    rootDir,
  } = context;

  // SPA
  const appEntry = getFilePath(path.join(rootDir, './src/app'));

  if (appEntry) {
    const entryConfig = config.entry('index');
    entryConfig.add(appEntry);
  }

  return {
    entryName: 'index',
    entryPath: appEntry,
  };
};

