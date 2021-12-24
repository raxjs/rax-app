import { useRouter } from 'rax-use-router';
import type { History } from 'history';
import RouteMatcher from './RouteMatcher';
import useCreation from './useCreation';
import { IRoute, RouteComponentType } from '../type';

interface IRouterProps {
  history: History;
  routes: IRoute[];
}

export default function Router({ history, routes }: IRouterProps): RouteComponentType {
  const currentPathName = history.location.pathname;
  const InitialComponent = useCreation(() => {
    const matcher = new RouteMatcher(routes);
    const route = matcher.match(currentPathName);
    if (!route) {
      throw new Error('Cannot find target route info to render page.');
    }
    if (!route.lazy) {
      return route.component;
    }
  });

  const { component } = useRouter({
    history,
    routes,
    InitialComponent,
  });

  return component;
}
