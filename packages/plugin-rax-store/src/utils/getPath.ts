import * as path from 'path';
import * as fse from 'fs-extra';
import getStoreFileType from './getStoreFileType';

/**
 * get the app store file path. If not exists, it will throw an error
 * @param srcPath
 * @returns
 */
export function getAppStorePath(srcPath: string) {
  const storeFileType = getStoreFileType(srcPath);
  // e.g: src/store.ts
  return storeFileType ? path.join(srcPath, `store${storeFileType}`) : '';
}

export function getPageStorePath(pageComponentPath: string) {
  const pageNameDir = path.dirname(pageComponentPath);
  const storeFileType = getStoreFileType(pageNameDir);
  // e.g: src/pages/Home/store.ts or src/pages/Home/About/store.ts
  return storeFileType ? path.join(pageNameDir, `store${storeFileType}`) : '';
}

export function getRaxPagesPath(rootDir: string) {
  const absoluteAppJSONPath = path.join(rootDir, 'src/app.json');
  const appJSON = fse.readJSONSync(absoluteAppJSONPath);
  const { routes } = appJSON;
  const pagesPath = [];
  routes.forEach(({ source, frames, pageHeader }) => {
    if (source) {
      pagesPath.push(source);
    }
    if (pageHeader && pageHeader.source) {
      pagesPath.push(pageHeader.source);
    }
    if (Array.isArray(frames)) {
      frames.forEach(({ source: frameSource }) => {
        if (frameSource) {
          pagesPath.push(frameSource);
        }
      });
    }
  });

  return pagesPath;
}
