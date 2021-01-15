import * as path from 'path';
import * as fse from 'fs-extra';
import { checkExportDefaultDeclarationExists } from '@builder/app-helpers';
import { getPageStorePath } from './getPath';

/**
 * @param routes the routes in staticConfig
 * @param tempPath the path of .rax/ dir
 * @param filename the filename to be replaced e.g.: /example/.rax/pages/Home/index -> /example/.rax/pages/Home/Page.tsx
 */
export default function modifyRoutes(routes, tempPath, filename, srcPath, mpa = false) {
  return routes.map((route) => {
    let pageSource = route.source;
    if (mpa) {
      const exportDefaultDeclarationExists = checkExportDefaultDeclarationExists(path.join(srcPath, pageSource));
      if (!exportDefaultDeclarationExists) {
        return route;
      }
    }

    const dir = path.dirname(pageSource);
    const pageName = path.parse(dir).name;
    const pageStorePath = getPageStorePath({ srcPath, projectType: 'ts', pageName });
    if (!fse.pathExistsSync(pageStorePath)) {
      return route;
    }

    if (/^\/?pages/.test(pageSource) && !/app$/.test(pageSource)) {
      if (/index$/.test(pageSource)) {
        pageSource = pageSource.replace(/index$/, filename);
      } else {
        pageSource = path.join(pageSource, filename);
      }

      console.log('pageSource==>', path.dirname(pageSource), tempPath);
      return {
        ...route,
        pageSource: path.join(tempPath, pageSource),
      };
    }
    return route;
  });
}
