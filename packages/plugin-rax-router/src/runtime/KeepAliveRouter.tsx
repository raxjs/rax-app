import { useState, useEffect, createElement, useRef, useCallback, Fragment } from 'rax';
import useCreation from './useCreation';
import RouteMatcher from './RouteMatcher';
import type { IRoute, AsyncRouteComponentType, RouteComponentType } from '../type';

type UpdaterType = (error: any, component?: JSX.Element) => void;

export default function KeepAliveRouter({ history, routes }) {
  const currentPathName = history.location.pathname;
  const keepAliveRoutesRef = useRef([]);
  // Append new keep alive route
  const appendKeepAliveRoute = useCallback((route) => {
    const newKeepAliveRoutes = [
      ...keepAliveRoutesRef.current,
      route,
    ];
    setKeepAliveRoutes(newKeepAliveRoutes);
    keepAliveRoutesRef.current = newKeepAliveRoutes;
  }, []);

  // Only get initialRoutes when the first render
  const initialRoutes = useCreation(() => {
    const matcher = new RouteMatcher(routes);
    let route = matcher.match(currentPathName);
    if (!route) {
      return [];
    }

    route = getFinalRoute(route);

    if (isPromise(route)) {
      loadAsyncComponent(() => route.component, (err, component) => {
        if (err) {
          throw err;
        }
        appendKeepAliveRoute({
          ...route,
          component,
        });
      });
      return [];
    }
    return [route];
  });
  // Keep-alive routes
  const [keepAliveRoutes, setKeepAliveRoutes] = useState(initialRoutes);
  // For force update the router component
  const [, setForceUpdate] = useState(0);

  useEffect(() => {
    const matcher = new RouteMatcher(routes);
    const unlisten = history.listen((location) => {
      const { pathname } = location;
      let targetRoute: IRoute = matcher.match(pathname);
      if (targetRoute && targetRoute.keepAlive) {
        targetRoute = getFinalRoute(targetRoute);
        // Find existed alive page from keepAliveRoutes
        if (keepAliveRoutesRef.current.find(({ path }) => path === pathname)) {
          setForceUpdate(Math.random());
        } else if (isPromise(targetRoute)) {
          loadAsyncComponent(() => (targetRoute.component as Promise<RouteComponentType>), (err, component) => {
            if (err) {
              throw err;
            }
            appendKeepAliveRoute({
              ...targetRoute,
              component,
            });
          });
        } else {
          appendKeepAliveRoute(targetRoute);
        }
      } else {
        // When router toggle, it need to hide visible page
        setForceUpdate(Math.random());
      }
    });
    return unlisten;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Fragment>
      {
        keepAliveRoutes.map(({ path, component }) =>
          <div key={path} style={{ display: path === currentPathName ? 'unset' : 'none' }}>{component}</div>)
      }
    </Fragment>
  );
}

function isPromise(route: IRoute): boolean {
  return route.component instanceof Promise;
}

function loadAsyncComponent(dynamicImport: AsyncRouteComponentType, updater: UpdaterType): void {
  dynamicImport().then((component) => {
    updater(null, component);
  }).catch((err) => {
    updater(err);
  });
}

function getFinalRoute(route: IRoute): IRoute {
  const { lazy = true } = route;
  if (!lazy) return route;
  return {
    ...route,
    component: (route.component as AsyncRouteComponentType)(),
  }
}
