import renderer from 'rax-server-renderer';
import { createElement } from 'rax';
import { getRenderApp } from './renderer';

function renderInServer(context, initialProps, options) {
  const { appConfig, buildConfig = {}, createBaseApp, emitLifeCycles, staticConfig } = options;

  const { runtime, appConfig: modifiedAppConfig } = createBaseApp(appConfig, buildConfig, context, staticConfig);

  // Emit app launch cycle
  emitLifeCycles();

  const App = getRenderApp(runtime, initialProps, {
    ...options,
    appConfig: modifiedAppConfig,
  });

  return renderer.renderToString(<App />, {
    defaultUnit: 'rpx',
  });
}

export default function raxAppRendererWithSSR(context, props, options) {
  const { appConfig } = options || {};
  if (!appConfig.router) {
    appConfig.router = {};
  }
  if (!appConfig.renderComponent) {
    if (appConfig.router.type !== 'browser') {
      throw new Error('[SSR]: Only support BrowserRouter when using SSR. You should set the router type to "browser". For more detail, please visit https://rax.js.org/docs/guide/route');
    }
    appConfig.router.type = 'static';
    appConfig.router.history = props.history;
  }
  return renderInServer(context, props, options);
}
