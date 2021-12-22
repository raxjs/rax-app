import { createElement, useCallback } from 'rax';
import {
  isNode,
  isWeb,
  isMiniApp,
  isBaiduSmartProgram,
  isByteDanceMicroApp,
  isKuaiShouMiniProgram,
  isWeChatMiniProgram,
} from 'universal-env';
// @ts-ignore
import { getHistory } from 'rax-app';
import KeepAliveRouter from './runtime/KeepAliveRouter';
import StaticRouter from './runtime/StaticRouter';
import Router from './runtime/Router';
import TabBarWrapper from './runtime/TabBar';
import { IRoute } from './type';

const isMiniAppPlatform =
  (isMiniApp || isBaiduSmartProgram || isByteDanceMicroApp || isWeChatMiniProgram || isKuaiShouMiniProgram) && !isWeb;

export default async (api) => {
  if (isMiniAppPlatform) return;
  const { appConfig, staticConfig, setRenderApp, modifyRoutes, getRuntimeValue } = api;
  const { routes: appRoutes } = staticConfig;
  const { router: appConfigRouter = {} } = appConfig;
  modifyRoutes(() => appRoutes);
  if (appConfigRouter.modifyRoutes) {
    modifyRoutes(appConfigRouter.modifyRoutes);
  }
  const history = getHistory();
  const TabBar = getRuntimeValue('TabBar');
  const tabBarConfig = getRuntimeValue('tabBarConfig');

  const renderRouter = (initialRoutes: IRoute[]) => {
    const { routes, keepAliveRoutes } = parseRoutes(initialRoutes);
    return () => {
      routes.push({
        // @ts-ignore
        component: '',
      });
      // Add KeepAliveRouter
      const RouterComponents = [
        <KeepAliveRouter key="rax-keep-alive-router" history={history} routes={keepAliveRoutes} />,
      ];
      const handleTabBarItemClick = useCallback((item) => {
        history.push(item.pageName);
      }, []);
      if (isNode) {
        // Add StaticRouter for node
        RouterComponents.push(<StaticRouter key="rax-static-router" history={history} routes={routes} />);
      } else {
        // Add Normal Router for other route
        RouterComponents.push(<Router key="rax-normal-router" history={history} routes={routes} />);
      }
      if (TabBar) {
        RouterComponents.push(
          <TabBarWrapper
            key="rax-app-tab-bar"
            history={history}
            renderTabBar={() => (
              <TabBar
                onClick={handleTabBarItemClick}
                config={tabBarConfig}
                currentPageName={history.location.pathname}
              />
            )}
          />,
        );
      }
      return RouterComponents;
    };
  };
  setRenderApp(renderRouter);
};

function parseRoutes(routes) {
  const initialRoutes: IRoute[] = [];
  const keepAliveRoutes: IRoute[] = [];
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
  if (isWeb && lazy) {
    // When it is lazy, PageComponent is a function which return a Promise<Component>
    const LazyComponent = PageComponent();
    return LazyComponent.then((component) => {
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
