/* eslint-disable */
import { render, createElement, useEffect, useState, Fragment, useLayoutEffect } from 'rax';
import { createNavigation, createTabBar } from 'create-app-container';
import { createUseRouter } from 'create-use-router';
import { isWeb, isWeex, isKraken } from 'universal-env';
import UniversalDriver from 'driver-universal';
import parseSearch from './parseSearch';

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
  const { staticConfig, history, routes, InitialComponent, context } = props;
  const { component: PageComponent } = useRouter(() => ({ history, routes, InitialComponent }));
  // Return null directly if not matched
  if (_isNullableComponent(PageComponent)) return null;

  if (isWeb) {
    const navigationProps = Object.assign(
      { staticConfig, component: PageComponent, history, location: history.location, routes, InitialComponent },
      { ...context.pageInitialProps },
    );
    return <AppNavigation {...navigationProps} />;
  }

  const pageProps = Object.assign({ history, location: history.location, routes, InitialComponent }, { ...context.pageInitialProps });

  const tabBarProps = { history, config: staticConfig.tabBar };
  return (
    <Fragment>
      <PageComponent {...pageProps} />
      <TabBar {...tabBarProps} />
    </Fragment>
  );
}

async function raxAppRenderer(options) {
  if (!options.appConfig) {
    options.appConfig = {};
  }

  const { appConfig, setAppConfig, getHistory } = options;

  setAppConfig(appConfig);

  if (process.env.__IS_SERVER__) return;

  let initialData = {};
  let pageInitialProps = {};

  // ssr enabled and the server has returned data
  if ((window as any).__INITIAL_DATA__) {
    initialData = (window as any).__INITIAL_DATA__.initialData;
    pageInitialProps = (window as any).__INITIAL_DATA__.pageData;
  } else {
    // ssr not enabled, or SSR is enabled but the server does not return data
    if (appConfig.app && appConfig.app.getInitialData) {
      const initialContext: any = {};
      const history = getHistory();
      if (history) {
        const { pathname, search } = history.location;
        const query = parseSearch(search);
        initialContext.pathname = pathname;
        initialContext.query = query;
      }
      initialData = await appConfig.app.getInitialData(initialContext);
    }
  }

  const context = { initialData, pageInitialProps };
  _renderApp(context, options);
}

function _renderApp(context, options) {
  const {
    appConfig,
    buildConfig,
    createBaseApp,
    emitLifeCycles,
    pathRedirect,
    getHistory,
    staticConfig,
    createAppInstance,
  } = options;

  const {
    runtime,
    appConfig: appDynamicConfig,
  } = createBaseApp(appConfig);

  // Set custom driver
  if (typeof staticConfig.driver !== 'undefined') {
    driver = staticConfig.driver;
  }

  const { routes } = staticConfig;

  // Like https://xxx.com?_path=/page1, use `_path` to jump to a specific route.
  const history = getHistory();
  pathRedirect(history, routes);

  let _initialComponent;
  return _matchInitialComponent(history.location.pathname, routes)
    .then((initialComponent) => {
      _initialComponent = initialComponent;
      const props = {
        staticConfig,
        history,
        routes,
        InitialComponent: _initialComponent,
        context,
      };

      const { app = {} } = appDynamicConfig;
      const { rootId } = app;

      let appInstance;

      // For rax-app 2.x
      if (typeof createAppInstance === 'function') {
        appInstance = createAppInstance(initialComponent);
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

