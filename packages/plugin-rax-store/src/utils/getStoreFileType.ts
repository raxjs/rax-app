import * as path from 'path';
import * as globby from 'globby';

/**
 * return the store file type
 */
function getStoreFileType(dirPath: string): string {
  const matchingPaths = globby.sync('store.*', { cwd: dirPath });

  return matchingPaths.length > 0 ? path.extname(matchingPaths[0]).replace('.', '') : '';
}

export default getStoreFileType;
