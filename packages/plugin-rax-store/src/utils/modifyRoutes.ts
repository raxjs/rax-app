import * as path from 'path';
import * as fse from 'fs-extra';
import { checkExportDefaultDeclarationExists } from '@builder/app-helpers';
import { getPageStorePath } from './getPath';

function modifyRoute(route, ...args) {
  const [tempPath, filename, srcPath, projectType, mpa = false] = args;
  let pageSource = route.source;
  if (mpa) {
    const exportDefaultDeclarationExists = checkExportDefaultDeclarationExists(path.join(srcPath, pageSource));
    if (!exportDefaultDeclarationExists) {
      return route;
    }
  }

  const dir = path.dirname(pageSource);
  const pageName = path.parse(dir).name;
  const pageStorePath = getPageStorePath({ srcPath, projectType, pageName });
  if (!fse.pathExistsSync(pageStorePath)) {
    return route;
  }

  if (/^\/?pages/.test(pageSource) && !/app$/.test(pageSource)) {
    if (/index$/.test(pageSource)) {
      pageSource = pageSource.replace(/index$/, filename);
    } else {
      pageSource = path.join(pageSource, filename);
    }

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
 * @param filename the filename to be replaced e.g.: /example/.rax/pages/Home/index -> /example/.rax/pages/Home/Page.tsx
 * @param srcPath the project source path  e.g.: /Users/project/src
 * @param projectType typescript or javascript
 * @param mpa wheather MPA
 */
export default function modifyRoutes(routes, ...args) {
  return routes.map((route) => {
    if (route.source) {
      return modifyRoute(route, ...args);
    } else {
      if (route.tabHeader) {
        route.tabHeader = modifyRoute(route.tabHeader, ...args);
      }
      if (route.frames) {
        route.frames = modifyRoutes(route.frames, ...args);
      }
    }
    return route;
  });
}
