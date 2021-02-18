import * as path from 'path';
import * as fse from 'fs-extra';

export function getAppStorePath({ srcPath, projectType }) {
  // e.g: src/store.ts
  const appStoreFilePath = path.join(srcPath, `store.${projectType}`);
  return appStoreFilePath;
}

export function getPageStorePath({ srcPath, projectType, pageName }) {
  const pagePath = path.join('pages', pageName);

  const pageNameDir = path.join(srcPath, pagePath);
  // e.g: src/pages/${pageName}/store.ts
  const pageStoreFilePath = path.join(pageNameDir, `store.${projectType}`);

  return pageStoreFilePath;
}

export function getRaxPagesName(rootDir) {
  const pagesPath = getRaxPagesPath(rootDir);
  return pagesPath.map(getRaxPageName);
}

export function getRaxPageName(pagePath) {
  const dir = path.dirname(pagePath);
  const pageName = path.parse(dir).name;
  return pageName;
}

export function getRaxPagesPath(rootDir) {
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
