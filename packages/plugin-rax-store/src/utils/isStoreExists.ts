import * as fse from 'fs-extra';
import * as path from 'path';
import { getAppStorePath, getPageStorePath, getRaxPagesName } from './getPath';

/**
 * check src/store.[js|ts] and src/pages/PageName/store.[js|ts] if it exists
 */
export default ({ rootDir, srcDir, projectType }) => {
  const pagesName = getRaxPagesName(rootDir);
  const srcPath = path.join(rootDir, srcDir);

  const appStoreFilePath = getAppStorePath({ srcPath, projectType });
  const appStoreExists = fse.pathExistsSync(appStoreFilePath);

  return appStoreExists || pagesName.some((pageName) => {
    const pageStoreFilePath = getPageStorePath({ srcPath, pageName, projectType });
    const pageStoreExists = fse.pathExistsSync(pageStoreFilePath);

    return pageStoreExists;
  });
};
