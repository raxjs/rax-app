import * as path from 'path';
import { checkExportDefaultDeclarationExists } from '@builder/app-helpers';
import { getPageStorePath } from './getPath';

function modifyRoute(route: any, tempPath: string, srcPath: string, mpa: boolean) {
  const pageSource = route.source;
  if (mpa) {
    const exportDefaultDeclarationExists = checkExportDefaultDeclarationExists(path.join(srcPath, pageSource));
    if (!exportDefaultDeclarationExists) {
      return route;
    }
  }

  const dir = path.dirname(pageSource);
  const pageName = path.parse(dir).name;
  const pageStorePath = getPageStorePath(srcPath, pageName);
  if (!pageStorePath) {
    // if page store doesn't exist, return the origin route
    return route;
  }

  if (/^\/?pages/.test(pageSource)) {
    return {
      ...route,
      pageSource: path.join(tempPath, pageSource),
    };
  }
  return route;
}

/**
 * @param routes the routes in staticConfig
 * @param tempPath the path of .rax/ dir
 * @param srcPath the project source path  e.g.: /Users/project/src
 * @param mpa whether or not MPA
 */
export default function modifyRoutes(
  routes: any[],
  tempPath: string,
  srcPath: string,
  mpa: boolean,
) {
  return routes.map((route) => {
    if (route.pageHeader) {
      route.pageHeader = modifyRoute(route.pageHeader, tempPath, srcPath, mpa);
    }
    if (route.frames) {
      route.frames = modifyRoutes(route.frames, tempPath, srcPath, mpa);
    }
    return modifyRoute(route, tempPath, srcPath, mpa);
  });
}
