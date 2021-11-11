import { createElement, useEffect } from 'rax';
import { isWeb } from 'universal-env';


export default async (api) => {
  const { appConfig, staticConfig, wrapperPageComponent } = api;
  const { router: appConfigRouter = {} } = appConfig;
  const { history } = appConfigRouter;

  wrapperPageComponent((PageComponent) => {
    const RootWrapper = () => {
      const routerProps = { history, location: history?.location, pageConfig: PageComponent.__pageConfig };
      useEffect(() => {
        if (isWeb) {
          document.title = PageComponent.__pageConfig.window?.title || staticConfig.window?.title;
        }
      }, []);
      return <PageComponent {...routerProps} />;
    };
    return RootWrapper;
  });
};
