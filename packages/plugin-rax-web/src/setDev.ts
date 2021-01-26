// The HTML assets path is related to the webpack output filename.
// It is determined by webpack configuration, but not vary based on the operating system.
const HTMLAssetPath = 'index.html';

export default (config) => {
  const devServerBeforeHook = config.devServer.get('before');
  config.devServer.set('before', (app, devServer) => {
    if (typeof devServerBeforeHook === 'function') {
      devServerBeforeHook(app, devServer);
    }
    // Get web compiler for intercept AppHistoryFallback
    const compiler = devServer.compiler.compilers[0];
    const httpResponseQueue = [];
    let fallbackHTMLContent;
    compiler.hooks.emit.tap('AppHistoryFallback', (compilation) => {
      if (compilation.assets[HTMLAssetPath]) {
        fallbackHTMLContent = compilation.assets[HTMLAssetPath].source();
      } else {
        fallbackHTMLContent = 'Document Not Found.';
      }

      let res;
      // eslint-disable-next-line
      while (res = httpResponseQueue.shift()) {
        res.send(fallbackHTMLContent);
      }
    });

    app.get(/^\/?(?!\.(js|html|css|json))$/, (req, res) => {
      if (fallbackHTMLContent !== undefined) {
        res.send(fallbackHTMLContent);
      } else {
        httpResponseQueue.push(res);
      }
    });
  });
};
