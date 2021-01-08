import * as path from 'path';

export default function modifyRoutes(routes, targetPath, filename) {
  return routes.map((route) => {
    let pageSource = route.source;

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
