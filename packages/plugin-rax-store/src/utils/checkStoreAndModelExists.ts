import * as fse from 'fs-extra';
import { getAppModelsPath, getAppStorePath, getPageModelPath, getPageStorePath, getRaxPagesName } from './getPath';

export default ({ rootDir, srcDir, projectType }) => {
  const pagesName = getRaxPagesName(rootDir);

  const appStoreFilePath = getAppStorePath({ rootDir, srcDir, projectType });
  const appModelsDir = getAppModelsPath({ rootDir, srcDir });

  return fse.pathExistsSync(appStoreFilePath) ||
      fse.pathExistsSync(appModelsDir) ||
      pagesName.some((pageName) => {
        const pageStoreFilePath = getPageStorePath({ rootDir, srcDir, pageName, projectType });
        const { pageModelsDir, pageModelFile } = getPageModelPath({ rootDir, srcDir, pageName, projectType });

        return fse.pathExistsSync(pageStoreFilePath) ||
          fse.pathExistsSync(pageModelsDir) ||
          fse.pathExistsSync(pageModelFile);
      });
};
