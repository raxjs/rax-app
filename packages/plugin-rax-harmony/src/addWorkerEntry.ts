import * as path from 'path';
import getFilePath from './utils/getFilePath';

export default function addWorkerEntry(config, { rootDir }) {
  const workerEntry = getFilePath(path.join(rootDir, 'src/app-worker'));

  if (workerEntry) {
    // worker file output name is app.js
    // const workerEntryConfig = config.entry('app');
    // workerEntryConfig.add(workerEntry);
  }
}
