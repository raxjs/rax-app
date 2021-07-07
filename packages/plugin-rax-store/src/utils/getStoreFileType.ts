import * as path from 'path';
import * as fse from 'fs-extra';

const fileTypes = ['.js', '.ts'];
/**
 * return the store file type
 */
function getStoreFileType(dirPath: string) {
  return fileTypes.find((fileType) => fse.pathExistsSync(path.join(dirPath, `store${fileType}`))) || '';
}

export default getStoreFileType;
