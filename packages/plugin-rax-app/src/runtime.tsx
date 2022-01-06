import { createElement, useEffect, useState } from 'rax';
import { isWeb } from 'universal-env';
// @ts-ignore
import { getHistory, getSearchParams } from 'rax-app';

export default async (api) => {
  const { appConfig, staticConfig, wrapperPageComponent, addProvider, context } = api;

  if (appConfig.app && appConfig.app.addProvider) {
    addProvider(appConfig.app.addProvider);
  }

  wrapperPageComponent(isWeb ? wrapperPageWithWeb(staticConfig) : wrapperPageWithOtherPlatform(context));
};

function wrapperPageWithOtherPlatform(context) {
  const WrapperPageFn = (PageComponent) => {
    const { __pageConfig: pageConfig } = PageComponent;
    const PageWrapper = (props) => {
      const history = getHistory();
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

function wrapperPageWithWeb(staticConfig) {
  const wrapperPage = (PageComponent) => {
    const { __pageConfig: pageConfig } = PageComponent;

    const PageWrapper = (props) => {
      const history = getHistory();
      const location = history?.location || window.location;
      const [data, setData] = useState((window as any)?.__INITIAL_DATA__?.pageInitialProps);
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
              query: getSearchParams(),
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
