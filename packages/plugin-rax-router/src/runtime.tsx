import { createElement, useEffect } from 'rax';
import { useRouter } from 'rax-use-router';
import { isNode, isWeb } from 'universal-env';

export default async (api) => {
  const { appConfig, staticConfig, setRenderApp, modifyRoutes, wrapperPageComponent } = api;
  const { routes: appRoutes } = staticConfig;
  const { router: appConfigRouter = {} } = appConfig;
  modifyRoutes(() => appRoutes);
  if (appConfigRouter.modifyRoutes) {
    modifyRoutes(appConfigRouter.modifyRoutes);
  }
  const { history } = appConfigRouter;

  wrapperPageComponent((PageComponent) => {
    const RootWrapper = () => {
      const routerProps = { history, location: history.location, pageConfig: PageComponent.__pageConfig };
      useEffect(() => {
        if (isWeb) {
          document.title = PageComponent.window?.title || staticConfig.window?.title;
        }
      }, []);
      return <PageComponent {...routerProps} />;
    };
    return RootWrapper;
  });

  const renderRouter =
    (routes) =>
      () => {
        const currentPathName = appConfigRouter.history.location.pathname;
        const parsedRoutes = parseRoutes(routes);
        const targetRoute = parsedRoutes.find(({ path }) => path === currentPathName);
        if (isNode) {
          const { component } = useRouter({
            history,
            routes: parsedRoutes,
            InitialComponent: targetRoute.component,
          });
          return component;
        } else {
          let InitialComponent;
          if (!targetRoute.lazy) {
            InitialComponent = targetRoute.component;
          }
          const { component } = useRouter({
            history,
            routes: parseRoutes(routes),
            InitialComponent,
          });
          return component;
        }
      };
  setRenderApp(renderRouter);
};

function parseRoutes(routes) {
  return routes.map((route) => {
    const { routeWrappers, ...others } = route;
    let component;
    if (route.lazy) {
      component = route.component.then((PageComponent) => {
        PageComponent.__pageConfig = others;
        return createElement(wrapperRoute(PageComponent, routeWrappers));
      });
    } else {
      component = createElement(wrapperRoute(route.component, routeWrappers));
      component.__pageConfig = others;
    }
    return {
      ...others,
      component,
    };
  });
}

function wrapperRoute(component, routerWrappers) {
  return (routerWrappers || []).reduce((acc, curr) => {
    const compose = curr(acc);
    if (acc.getInitialProps) {
      compose.getInitialProps = acc.getInitialProps;
    }
    return compose;
  }, component);
}
