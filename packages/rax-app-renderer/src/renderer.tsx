/* eslint-disable */
import { render, createElement, Fragment, FunctionComponent } from 'rax';
import { isWeb, isWeex, isKraken } from 'universal-env';
import UniversalDriver from 'driver-universal';
import { IContext, RenderOptions } from './types';
import { setInitialData } from './initialData';
import parseSearch from './parseSearch';
import type { RuntimeModule } from 'create-app-shared';

let driver = UniversalDriver;

async function raxAppRenderer(options) {
  if (!options.appConfig) {
    options.appConfig = {};
  }

  const { appConfig, buildConfig, appLifecycle, staticConfig } = options;
  const { createBaseApp, emitLifeCycles, initAppLifeCycles } = appLifecycle;

  const context: IContext = {};
  // ssr enabled and the server has returned data
  if ((window as any)?.__INITIAL_DATA__) {
    context.initialData = (window as any).__INITIAL_DATA__.initialData;
    context.pageInitialProps = (window as any).__INITIAL_DATA__.pageInitialProps;
  } else if (isWeb && appConfig?.app?.getInitialData) {
    const { pathname, search } = window.location;
    const query = parseSearch(search);
    const initialContext = {
      pathname,
      query,
    };
    context.initialData = await appConfig.app.getInitialData(initialContext);
  }

  setInitialData(context.initialData);
  const { runtime, appConfig: modifiedAppConfig } = createBaseApp(appConfig, buildConfig, context, staticConfig);
  initAppLifeCycles();

  // set InitialData, can get the return value through getInitialData method
  setInitialData(context.initialData);
  // emit app launch cycle
  emitLifeCycles();

  return _render(runtime, context, {
    ...options,
    appConfig: modifiedAppConfig,
  });
}

function _render(runtime: RuntimeModule, context: IContext, options: RenderOptions) {
  const { appConfig = {}, buildConfig, pageConfig } = options;
  const { rootId, mountNode } = appConfig.app;
  const webConfig = buildConfig.web || {};
  const App = getRenderApp(
    runtime,
    {
      pageConfig,
      ...context.pageInitialProps,
    },
    options,
  );

  const appMountNode = _getAppMountNode(mountNode, rootId);
  if (runtime?.modifyDOMRender) {
    return runtime?.modifyDOMRender?.({ App, appMountNode });
  }
  // add process.env.SSR for tree-shaking
  // @ts-ignore
  render(<App />, appMountNode, {
    driver,
    hydrate: webConfig.hydrate || webConfig.snapshot || webConfig.ssr || webConfig.staticExport,
  });
}

function _getAppMountNode(mountNode: HTMLElement, rootId: string) {
  if (isWeex || isKraken) return null;
  return mountNode || document.getElementById(rootId) || document.getElementById('root');
}

export function getRenderApp(runtime: RuntimeModule, initialProps, options: RenderOptions): FunctionComponent {
  const { ErrorBoundary, appConfig = { app: {} }, TabBar } = options;
  const { ErrorBoundaryFallback, onErrorBoundaryHandler, errorBoundary } = appConfig.app;
  const AppProvider = runtime?.composeAppProvider?.();
  const AppComponent = runtime?.getAppComponent?.();
  function App() {
    const appComponent = <AppComponent {...initialProps} />;
    let rootApp = AppProvider ? <AppProvider>{appComponent}</AppProvider> : appComponent;
    if (TabBar) {
      rootApp = (
        <Fragment>
          {rootApp}
          <TabBar />
        </Fragment>
      );
    }
    if (errorBoundary) {
      return (
        <ErrorBoundary Fallback={ErrorBoundaryFallback} onError={onErrorBoundaryHandler}>
          {rootApp}
        </ErrorBoundary>
      );
    }
    return rootApp;
  }
  return App;
}

export default raxAppRenderer;
