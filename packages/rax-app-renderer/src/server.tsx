import renderer from 'rax-server-renderer';
import { getRenderAppInstance } from './renderer';

function renderInServer(context, props, options) {
  const { appConfig, buildConfig = {}, createBaseApp, emitLifeCycles } = options;
  const { runtime, appConfig: modifiedAppConfig } = createBaseApp(appConfig, buildConfig, context);

  options.appConfig = modifiedAppConfig;
  // Emit app launch cycle
  emitLifeCycles();

  const App = getRenderAppInstance(runtime, props, options);
  return renderer.renderToString(App, {
    defaultUnit: 'rpx',
  });
}

export default function raxAppRendererWithSSR(context, props, options) {
  const { appConfig } = options || {};
  if (!appConfig.router) {
    appConfig.router = {};
  }
  appConfig.router.type = 'static';
  return renderInServer(context, props, options);
}
