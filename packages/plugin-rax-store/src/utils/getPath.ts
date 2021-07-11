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

function getPagePath(srcPath: string, pageName: string) {
  return path.join(srcPath, 'pages', pageName);
}

export function getPageStorePath(srcPath: string, pageName: string) {
  const pageNameDir = getPagePath(srcPath, pageName);
  const storeFileType = getStoreFileType(pageNameDir);
  // e.g: src/pages/Home/store.ts
  return storeFileType ? path.join(pageNameDir, `store${storeFileType}`) : '';
}

export function getRaxPagesName(rootDir: string) {
  const pagesPath = getRaxPagesPath(rootDir);
  return pagesPath.map(getRaxPageName);
}

export function getRaxPageName(pagePath: string) {
  const dir = path.dirname(pagePath);
  const pageName = path.parse(dir).name;
  return pageName;
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
