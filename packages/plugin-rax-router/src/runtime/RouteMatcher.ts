import { pathToRegexp } from 'path-to-regexp';
import { IRoute } from '../type';

interface ICachedRoutes {
  [key: string]: IRoute;
}

export default class RouteMatcher {
  cachedRoutes: ICachedRoutes = {};
  private routes: IRoute[];

  constructor(routes: IRoute[]) {
    this.routes = routes;
  }

  match(currentPathName: string) {
    let matchedRoute;
    let notFoundRoute;

    for (let i = 0; i < this.routes.length; i++) {
      const { path } = this.routes[i];
      if (this.cachedRoutes[currentPathName]) return this.cachedRoutes[currentPathName];
      if (path) {
        const regexp = pathToRegexp(path);
        if (regexp.test(currentPathName)) {
          matchedRoute = this.routes[i];
          this.cachedRoutes[path] = this.routes[i];
          break;
        }
      } else {
        notFoundRoute = this.routes[i];
      }
    }
    return matchedRoute || notFoundRoute;
  }
}
