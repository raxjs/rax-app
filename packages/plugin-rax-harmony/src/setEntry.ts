import * as path from 'path';
import addWorkerEntry from './addWorkerEntry';
import getFilePath from './utils/getFilePath';

export default (config, context) => {
  const {
    rootDir,
    userConfig: { harmony = {} },
  } = context;

  if (!harmony.mpa) {
    // SPA
    const appEntry = getFilePath(path.join(rootDir, './src/app'));

    if (appEntry) {
      const entryConfig = config.entry('index');
      entryConfig.add(appEntry);
    }

    addWorkerEntry(config, { rootDir });
  }
};

