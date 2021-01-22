import renderer from 'rax-server-renderer';
import { getRenderAppInstance } from './renderer';

async function renderInServer(context, props, options) {
  const { appConfig, buildConfig = {}, createBaseApp, emitLifeCycles } = options;
  const { runtime, appConfig: modifiedAppConfig } = await createBaseApp(appConfig, buildConfig, context);

  options.appConfig = modifiedAppConfig;
  // Emit app launch cycle
  emitLifeCycles();

  const App = getRenderAppInstance(runtime, props, options);
  return renderer.renderToString(App, {
    defaultUnit: 'rpx',
  });
}

export default async function raxAppRendererWithSSR(context, props, options) {
  const { appConfig } = options || {};
  if (!appConfig.router) {
    appConfig.router = {};
  }
  appConfig.router.type = 'static';
  return await renderInServer(context, props, options);
}
