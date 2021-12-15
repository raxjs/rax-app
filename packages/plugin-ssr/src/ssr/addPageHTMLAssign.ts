export default () => {
  return `
    const { setInitialData } = require('rax-app-renderer');
    const raxServerRenderer = require('rax-app-renderer/lib/server').default;

    const history = {
      location: ctx.location,
    };

    setHistory(history);

    if (!data.initialData) {
      data.initialData = appConfig.app && appConfig.app.getInitialData ? await appConfig.app.getInitialData(ctx) : {};
    }

    setInitialData(data.initialData);

    const pageHTML = raxServerRenderer(
      {
        initialContext: ctx,
        enableRouter,
        pageInitialProps: data.pageInitialProps,
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
