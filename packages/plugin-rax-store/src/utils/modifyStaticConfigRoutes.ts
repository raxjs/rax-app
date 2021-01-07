import * as path from 'path';

export default (staticConfig, targetPath) => {
  const { routes } = staticConfig;

  const modifyRoutes = routes.map((route) => {
    let pageSource = route.source;

    if (/^\/?pages/.test(pageSource) && !/app$/.test(pageSource)) {
      if (/index$/.test(pageSource)) {
        pageSource = pageSource.replace(/index$/, 'Page.tsx');
      } else {
        pageSource = path.join(pageSource, 'Page.tsx');
      }
      return {
        ...route,
        pageSource: path.join(targetPath, pageSource),
      };
    }
    return route;
  });

  staticConfig.routes = modifyRoutes;

  return staticConfig;
};
