/* eslint-disable */
import { render, createElement, useEffect, useState, Fragment, useLayoutEffect } from 'rax';
import { createNavigation, createTabBar } from 'create-app-container';
import { createUseRouter } from 'create-use-router';
import { isWeb, isWeex, isKraken } from 'universal-env';
import UniversalDriver from 'driver-universal';
import parseSearch from './parseSearch';
import { IInitialContext } from './types';
import { setInitialData } from './initialData';

const useRouter = createUseRouter({ useState, useLayoutEffect });

let AppNavigation;
let TabBar;

if (isWeb) {
  AppNavigation = createNavigation({ createElement, useEffect, useState, Fragment });
} else {
  TabBar = createTabBar({ createElement, useEffect, useState, Fragment });
}

let driver = UniversalDriver;

function _isNullableComponent(component) {
  return !component || Array.isArray(component) && component.length === 0;
}

function _matchInitialComponent(fullpath, routes) {
  let initialComponent = null;
  for (let i = 0, l = routes.length; i < l; i++) {
    if (fullpath === routes[i].path || routes[i].regexp && routes[i].regexp.test(fullpath)) {
      initialComponent = routes[i].component;
      if (typeof initialComponent === 'function') initialComponent = initialComponent();
      break;
    }
  }

  return Promise.resolve(initialComponent);
}

function App(props) {
  const { staticConfig, history, routes, InitialComponent, pageInitialProps } = props;
  const { component: PageComponent } = useRouter(() => ({ history, routes, InitialComponent }));
  // Return null directly if not matched
  if (_isNullableComponent(PageComponent)) return null;

  if (isWeb) {
    const navigationProps = Object.assign(
      { staticConfig, component: PageComponent, history, location: history.location, routes },
    );
    return <AppNavigation {...navigationProps} />;
  }

  const pageProps = { history, location: history.location, ...pageInitialProps };

  const tabBarProps = { history, config: staticConfig.tabBar };
  return (
    <Fragment>
      <PageComponent {...pageProps} />
      <TabBar {...tabBarProps} />
    </Fragment>
  );
}

function raxAppRenderer(options) {
  if (!options.appConfig) {
    options.appConfig = {};
  }

  const { appConfig, setAppConfig } = options;

  setAppConfig(appConfig);

  if (process.env.__IS_SERVER__) return;

  renderInClient(options);
}

async function renderInClient(options) {
  const {
    appConfig,
    buildConfig,
    createBaseApp,
    emitLifeCycles,
    pathRedirect,
    staticConfig,
    createAppInstance,
  } = options;

  const {
    runtime,
    appConfig: appDynamicConfig,
    history,
  } = createBaseApp(appConfig, buildConfig);

  let pageInitialProps = {};
  const initialContext: IInitialContext = {
    pathname: '',
    query: {}
  };

  // ssr enabled and the server has returned data
  if ((window as any).__INITIAL_DATA__) {
    setInitialData((window as any).__INITIAL_DATA__.initialData);
    pageInitialProps = (window as any).__INITIAL_DATA__.pageInitialProps;
  } else {
    // ssr not enabled, or SSR is enabled but the server does not return data
    if (appConfig.app && appConfig.app.getInitialData) {
      const { pathname, search } = history.location;
      const query = parseSearch(search);
      initialContext.pathname = pathname;
      initialContext.query = query;
      setInitialData(await appConfig.app.getInitialData(initialContext));
    }
  }

  // Set custom driver
  if (typeof staticConfig.driver !== 'undefined') {
    driver = staticConfig.driver;
  }

  const { routes } = staticConfig;

  // Like https://xxx.com?_path=/page1, use `_path` to jump to a specific route.
  pathRedirect(history, routes);

  return _matchInitialComponent(history.location.pathname, routes)
    .then(async (InitialComponent) => {
      const initialComponent = InitialComponent();
      if (initialComponent.getInitialProps) {
        pageInitialProps = await initialComponent.getInitialProps(initialContext);
      }
      const props = {
        staticConfig,
        history,
        routes,
        InitialComponent,
        pageInitialProps
      };

      const { app = {} } = appDynamicConfig;
      const { rootId } = app;

      let appInstance;

      // For rax-app 2.x
      if (typeof createAppInstance === 'function') {
        appInstance = createAppInstance(InitialComponent);
      } else {
        appInstance = getRenderAppInstance(runtime, props, options);
      }

      // Emit app launch cycle
      emitLifeCycles();

      const rootEl = isWeex || isKraken ? null : document.getElementById(rootId);
      if (isWeb && rootId === null) console.warn('Error: Can not find #root element, please check which exists in DOM.');
      const webConfig = buildConfig.web || {};
      return render(
        appInstance,
        rootEl,
        { driver, hydrate: webConfig.hydrate || webConfig.snapshot || webConfig.ssr },
      );
    });
}

export function getRenderAppInstance(runtime, props, options) {
  const { ErrorBoundary, appConfig = {} } = options;
  const { ErrorBoundaryFallback, onErrorBoundaryHander, errorBoundary } = appConfig.app || {};
  const AppProvider = runtime?.composeAppProvider?.();
  const RootComponent = () => {
    if (AppProvider) {
      return (
        <AppProvider><App {...props} /></AppProvider>
      );
    }
    return <App {...props} />;
  };
  const Root = <RootComponent />;

  if (errorBoundary && ErrorBoundary) {
    return (<ErrorBoundary Fallback={ErrorBoundaryFallback} onError={onErrorBoundaryHander}>{Root}</ErrorBoundary>);
  } else {
    return Root;
  }
}

export default raxAppRenderer;

