// let compilationCache;

// function getHTMLFromCompilation(compilation, filename) {
//   if (compilation.assets[`${filename}.html`]) {
//     return compilation.assets[`${filename}.html`].source();
//   }
//   return 'Document Not Found.';
// }

export default (config) => {
  // TODO: webpack5 before has been changed to onBeforeSetupMiddleware
  // const devServerBeforeHook = config.devServer.get('onBeforeSetupMiddleware');
  // config.devServer.set('onBeforeSetupMiddleware', (app, devServer) => {
  //   if (!devServer) {
  //     // In webpack5, the first argument is devServer instance
  //     devServer = app;
  //     app = devServer.app;
  //   }
  //   if (typeof devServerBeforeHook === 'function') {
  //     devServerBeforeHook(devServer);
  //   }
  //   // Get web compiler for intercept AppHistoryFallback
  //   const compiler = devServer.compiler.compilers[0];
  //   const contextQueue = [];
  //   compiler.hooks.emit.tap('AppHistoryFallback', (compilation) => {
  //     let context;
  //     compilationCache = compilation;

  //     compilation.hooks.processAssets.tap
  //     // eslint-disable-next-line
  //     while ((context = contextQueue.shift())) {
  //       const { entryName, res } = context;
  //       res.send(getHTMLFromCompilation(compilation, entryName));
  //     }
  //   });

  //   app.get(/^\/?(?!\.(js|css|json))/, (req, res, next) => {
  //     const matched = req.url.match(/^\/(\S*?)\.html/);
  //     if (!matched) {
  //       next();
  //       return;
  //     }
  //     const entryName = matched[1];
  //     if (compilationCache) {
  //       res.send(getHTMLFromCompilation(compilationCache, entryName));
  //     } else {
  //       contextQueue.push({
  //         res,
  //         entryName,
  //       });
  //     }
  //   });
  // });
};
