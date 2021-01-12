import * as path from 'path';
import * as fse from 'fs-extra';

export function getAppStorePath({ rootDir, srcDir, projectType }) {
  // e.g: src/store.ts
  const appStoreFilePath = path.join(rootDir, srcDir, `store.${projectType}`);
  return appStoreFilePath;
}

export function getPageStorePath({ rootDir, srcDir, projectType, pageName }) {
  const pagePath = path.join('pages', pageName);

  const pageNameDir = path.join(rootDir, srcDir, pagePath);
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
  const pagesPath = routes.map((route) => route.source);

  return pagesPath;
}
