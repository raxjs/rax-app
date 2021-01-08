import * as path from 'path';
import { checkExportDefaultDeclarationExists } from '@builder/app-helpers';

export default function modifyRoutes(routes, targetPath, filename, srcPath?) {
  return routes.map((route) => {
    let pageSource = route.source;
    if (srcPath) {
      const exportDefaultDeclarationExists = checkExportDefaultDeclarationExists(path.join(srcPath, pageSource));
      if (!exportDefaultDeclarationExists) {
        return route;
      }
    }
    if (/^\/?pages/.test(pageSource) && !/app$/.test(pageSource)) {
      if (/index$/.test(pageSource)) {
        pageSource = pageSource.replace(/index$/, filename);
      } else {
        pageSource = path.join(pageSource, filename);
      }
      return {
        ...route,
        pageSource: path.join(targetPath, pageSource),
      };
    }
    return route;
  });
}
