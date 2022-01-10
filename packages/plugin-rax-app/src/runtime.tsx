import { createElement, useEffect, useState } from 'rax';
import { isWeb } from 'universal-env';

export default async (api) => {
  const { appConfig, wrapperPageComponent, addProvider } = api;

  if (appConfig.app && appConfig.app.addProvider) {
    addProvider(appConfig.app.addProvider);
  }

  wrapperPageComponent((isWeb && !process.env.__IS_SERVER__) ? wrapperPageWithWeb(api) : wrapperPageWithOtherPlatform(api));
};

function wrapperPageWithOtherPlatform({ appConfig, context }) {
  const WrapperPageFn = (PageComponent) => {
    const { __pageConfig: pageConfig } = PageComponent;
    const PageWrapper = (props) => {
      const history = appConfig?.router?.history;
      const pageProps = {
        ...props,
        ...context.pageInitialProps,
        history,
        location: history?.location,
        pageConfig,
      };
      return <PageComponent {...pageProps} />;
    };
    return PageWrapper;
  };
  return WrapperPageFn;
}

function wrapperPageWithWeb({ staticConfig, appConfig, applyRuntimeAPI }) {
  const wrapperPage = (PageComponent) => {
    const { __pageConfig: pageConfig } = PageComponent;

    const PageWrapper = (props) => {
      const history = appConfig?.router?.history;
      const location = history?.location;
      const [data, setData] = useState((window as any).__INITIAL_DATA__?.pageInitialProps);
      useEffect(() => {
        const title = pageConfig.window?.title || staticConfig.window?.title;
        // Avoid override developer custom title
        if (title && !document.title) {
          document.title = title;
        }

        // When enter the page for the first time, need to use window.__INITIAL_DATA__.pageInitialProps as props
        // And don't need to re-request to switch routes
        // Set the data to null after use, otherwise other pages will use
        if ((window as any).__INITIAL_DATA__?.pageInitialProps) {
          if ((window as any).__INITIAL_DATA__) {
            (window as any).__INITIAL_DATA__.pageInitialProps = null;
          }
        } else if (PageComponent.getInitialProps) {
          // When the server does not return data, the client calls getinitialprops
          (async () => {
            const initialContext = {
              pathname: location.pathname,
              query: applyRuntimeAPI('getSearchParams'),
              location,
            };
            const result = await PageComponent.getInitialProps(initialContext);
            setData(result);
          })();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return <PageComponent {...{ ...props, ...data, history, location, pageConfig }} />;
    };
    return PageWrapper;
  };
  return wrapperPage;
}
