import { createElement, useEffect } from 'rax';
import { isNode, isWeb } from 'universal-env';
import KeepAliveRouter from './runtime/KeepAliveRouter';
import StaticRouter from './runtime/StaticRouter';
import Router from './runtime/Router';

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
    (initialRoutes) => {
      const { routes, keepAliveRoutes } = parseRoutes(initialRoutes);
      return () => {
        routes.push({
          component: '',
        });

        // Add KeepAliveRouter
        const RouterComponents = [<KeepAliveRouter key="rax-keep-alive-router" history={appConfigRouter.history} routes={keepAliveRoutes} />];

        if (isNode) {
          // Add StaticRouter for node
          RouterComponents.push(
            <StaticRouter key="rax-static-router" history={appConfigRouter.history} routes={routes} />,
          );
        } else {
          // Add Normal Router for other route
          RouterComponents.push(
            <Router key="rax-normal-router" history={appConfigRouter.history} routes={routes} />,
          );
        }
        return RouterComponents;
      };
    };
  setRenderApp(renderRouter);
};

function parseRoutes(routes) {
  const initialRoutes = [];
  const keepAliveRoutes = [];
  routes.forEach((route) => {
    const { routeWrappers, ...others } = route;
    if ((isWeb || isNode) && route.keepAlive) {
      keepAliveRoutes.push({
        ...others,
        component: getComponentByLazy(route.component, { route }),
      });
      return;
    }

    initialRoutes.push({
      ...others,
      component: getComponentByLazy(route.component, { route }),
    });
  });

  return {
    routes: initialRoutes,
    keepAliveRoutes,
  };
}

function getComponentByLazy(PageComponent, { route }) {
  const { lazy = true } = route;
  if (lazy) {
    return PageComponent.then((component) => {
      return wrapperPage(component, { route });
    });
  }

  return wrapperPage(PageComponent, { route });
}

function wrapperPage(PageComponent, { route }) {
  const { routeWrappers, ...others } = route;
  PageComponent.__pageConfig = others;
  const Wrapper = wrapperRoute(PageComponent, routeWrappers);
  return <Wrapper key={route.path} />;
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
