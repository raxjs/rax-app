export default () => {
  return `
    const { setInitialData } = require('rax-app-renderer');
    const raxServerRenderer = require('rax-app-renderer/lib/server').default;
    const { req, res } = ctx;
    const search = req.search || '';
    const parsedQuery = parseSearch(search);
    const pathname = req.path;
    const location = { pathname, search, state: null };
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

    function parseSearch (search) {
      if (!search) return {};
      const results = search.substr(1).split('&');
      const query = {};
      results.forEach((result) => {
        const [key, value] = result.split('=');
        query[key] = value;
      });
      return query;
    }

    const pageHTML = raxServerRenderer({ initialContext }, {
        pageConfig,
        history: {
          location
        },
        location,
        ...data.pageInitialProps,
    }, {
      appConfig,
      createBaseApp,
      emitLifeCycles,
      TabBar,
      staticConfig,
    });
  `;
};
