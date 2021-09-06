import RouteMatcher from './RouteMatcher';

export default function StaticRouter({ history, routes }) {
  const matcher = new RouteMatcher(routes);
  const route = matcher.match(history.location.pathname);
  if (!route) {
    throw new Error('Cannot find target route info to render page.');
  }
  return route.component;
}
