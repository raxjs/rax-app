import * as path from 'path';
import * as globby from 'globby';

const fileTypes = ['.js', '.ts'];
/**
 * return the store file type
 */
function getStoreFileType(dirPath: string): '.js' | 'ts' {
  const matchingPaths = globby.sync('store.*', { cwd: dirPath });
  let storeFileType;
  for (const matchingPath of matchingPaths) {
    const extname = path.extname(matchingPath);
    if (fileTypes.includes(extname)) {
      storeFileType = extname;
    }
  }
  if (storeFileType) {
    return storeFileType;
  }
  throw new Error(`store[${fileTypes.join('|')}] file in ${dirPath} doesn't exist.`);
}

export default getStoreFileType;
