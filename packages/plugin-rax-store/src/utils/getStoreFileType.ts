import * as path from 'path';
import * as globby from 'globby';

/**
 * return the store file type
 */
function getStoreFileType(dirPath: string): string {
  const matchingPaths = globby.sync('store.*', { cwd: dirPath });
  if (matchingPaths.length) {
    return path.extname(matchingPaths[0]).replace('.', '');
  }
  throw new Error(`Store file in ${dirPath} doesn't exist.`);
}

export default getStoreFileType;
