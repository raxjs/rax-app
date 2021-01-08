import * as path from 'path';
import { checkExportDefaultDeclarationExists } from '@builder/app-helpers';

/**
 * @param routes the routes in staticConfig
 * @param tempPath the path of .rax/ dir
 * @param filename the filename to be replaced e.g.: /example/.rax/pages/Home/index -> /example/.rax/pages/Home/Page.tsx
 */
export default function modifyRoutes(routes, tempPath, filename, srcPath?) {
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
        pageSource: path.join(tempPath, pageSource),
      };
    }
    return route;
  });
}
