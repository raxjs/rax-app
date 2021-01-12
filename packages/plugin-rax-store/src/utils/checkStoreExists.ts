import * as fse from 'fs-extra';
import { getAppStorePath, getPageStorePath, getRaxPagesName } from './getPath';

export default ({ rootDir, srcDir, projectType }) => {
  const pagesName = getRaxPagesName(rootDir);
  const appStoreFilePath = getAppStorePath({ rootDir, srcDir, projectType });

  const appStoreExists = fse.pathExistsSync(appStoreFilePath);

  return appStoreExists || pagesName.some((pageName) => {
    const pageStoreFilePath = getPageStorePath({ rootDir, srcDir, pageName, projectType });
    const pageStoreExists = fse.pathExistsSync(pageStoreFilePath);

    return pageStoreExists;
  });
};
