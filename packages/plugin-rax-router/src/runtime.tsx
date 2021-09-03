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
    (initialRoutes) => {
      return () => {
        const { routes, keepAliveRoutes } = parseRoutes(initialRoutes);
        if (isNode) {
          return (
            <>
              <StaticRouter history={appConfigRouter.history} initialRoutes={routes} />
            </>
          );
        }
        return (
          <>
            <Router history={appConfigRouter.history} initialRoutes={routes} initialKeepAliveRoutes={keepAliveRoutes} />
          </>
        );
      };
    };
  setRenderApp(renderRouter);
};

function StaticRouter({ history, initialRoutes }) {
  const currentPathName = history.location.pathname;
  const targetRoute = initialRoutes.find(({ path }) => path === currentPathName);
  return targetRoute.component;
}

function Router({ history, initialRoutes, initialKeepAliveRoutes }) {
  const currentPathName = history.location.pathname;
  const targetRoute = initialRoutes.find(({ path }) => path === currentPathName);

  let InitialComponent;
  if (!targetRoute.lazy) {
    InitialComponent = targetRoute.component;
  }
  const { component } = useRouter({
    history,
    routes: initialRoutes,
    InitialComponent,
  });

  return (
    <>
      {component}
      {initialKeepAliveRoutes.map(({ component: PageComponent, path }) => {
        return <div key={path} style={{ display: path === currentPathName ? 'block' : 'none' }}>{PageComponent}</div>;
      })}
    </>
  );
}

function parseRoutes(routes) {
  const initialRoutes = [];
  const keepAliveRoutes = [];
  routes.forEach((route) => {
    const { routeWrappers, ...others } = route;
    if (route.keepAlive) {
      // For router toggle placeholder
      initialRoutes.push({
        ...others,
        component: '',
      });
      keepAliveRoutes.push({
        ...others,
        component: wrapperPage(route.component, { route }),
      });
      return;
    }

    let component;
    if (route.lazy) {
      component = route.component.then((PageComponent) => wrapperPage(PageComponent, { route }));
    } else {
      component = wrapperPage(route.component, { route });
    }

    initialRoutes.push({
      ...others,
      component,
    });
  });

  return {
    routes: initialRoutes,
    keepAliveRoutes,
  };
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
