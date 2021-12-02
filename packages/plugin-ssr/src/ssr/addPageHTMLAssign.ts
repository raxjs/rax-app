export default () => {
  return `
    const { setInitialData } = require('rax-app-renderer');
    const raxServerRenderer = require('rax-app-renderer/lib/server').default;
    const { req, res } = ctx;
    const { pathname, hash, search } = parseUrl(req.url);
    const parsedQuery = queryString.parseUrl(req.url).query;
    const location = {
      pathname,
      search,
      state: null,
      hash,
    };
    const history = { location };
    setHistory(history);
    const initialContext = {
      req,
      res,
      pathname,
      query: parsedQuery,
      location,
    };

    if (!data.initialData) {
      data.initialData = appConfig.app && appConfig.app.getInitialData ? await appConfig.app.getInitialData(initialContext) : {};
    }

    setInitialData(data.initialData);

    const pageHTML = raxServerRenderer(
      {
        initialContext,
        enableRouter,
      },
      {
        pageConfig,
        history,
        location,
        ...data.pageInitialProps,
      },
      {
        appConfig,
        createBaseApp,
        emitLifeCycles,
        TabBar,
        staticConfig,
    });
  `;
};
