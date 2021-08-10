import renderer from 'rax-server-renderer';
import { createElement } from 'rax';
import { getRenderApp } from './renderer';

function renderInServer(context, props, options) {
  const { appConfig, buildConfig = {}, createBaseApp, emitLifeCycles } = options;
  const { runtime, appConfig: modifiedAppConfig } = createBaseApp(appConfig, buildConfig, context);

  // Emit app launch cycle
  emitLifeCycles();

  // TODO SSR
  // const App = getRenderApp(runtime, props, {
  //   ...options,
  //   appConfig: modifiedAppConfig,
  // });
  return renderer.renderToString(<div>123</div>, {
    defaultUnit: 'rpx',
  });
}

export default function raxAppRendererWithSSR(context, props, options) {
  const { appConfig } = options || {};
  if (!appConfig.router) {
    appConfig.router = {};
  }
  if (appConfig.router.type !== 'browser') {
    throw new Error('[SSR]: Only support BrowserRouter when using SSR. You should set the router type to "browser". For more detail, please visit https://rax.js.org/docs/guide/route');
  }
  appConfig.router.type = 'static';
  return renderInServer(context, props, options);
}
