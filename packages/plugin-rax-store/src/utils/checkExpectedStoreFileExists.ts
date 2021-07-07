import * as path from 'path';
import * as fse from 'fs-extra';
import { getRaxPagesName, getPageStorePath, getAppStorePath } from './getPath';

function checkStoreFileExists(rootDir: string, srcDir: string) {
  const srcPath = path.join(rootDir, srcDir);
  const appStoreExists = checkAppStoreExists(srcPath);
  const pageStoreExists = checkPageStoreExists(rootDir, srcPath);
  return appStoreExists || pageStoreExists;
}

/**
 * check if the src/store.[js/ts] exists
 */
function checkAppStoreExists(srcPath: string) {
  const appStorePath = getAppStorePath(srcPath);
  return fse.pathExistsSync(appStorePath);
}

/**
 * check if the src/pages/Home/store.[js|ts] exists
 */
function checkPageStoreExists(rootDir: string, srcPath: string) {
  const pagesName = getRaxPagesName(rootDir);
  return pagesName.some((pageName: string) => {
    const pageStorePath = getPageStorePath(srcPath, pageName);
    return fse.pathExistsSync(pageStorePath);
  });
}

export default checkStoreFileExists;
