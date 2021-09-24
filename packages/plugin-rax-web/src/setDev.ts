import { compatDevServer } from '@builder/compat-webpack4';
import { getHTMLByEntryName } from './utils/htmlCache';

let afterCompiled;

function getHTML(entryName) {
  const html = getHTMLByEntryName(entryName);
  if (html) return html;
  return 'Document Not Found.';
}

export default (config) => {
  const devServer = compatDevServer(config.devServer);
  const devServerBeforeHook = devServer.get('onBeforeSetupMiddleware');
  devServer.setValue('onBeforeSetupMiddleware', (app, server) => {
    if (!server) {
      // In webpack5, the first argument is devServer instance
      server = app;
      app = server.app;
    }
    if (typeof devServerBeforeHook === 'function') {
      devServerBeforeHook(server);
    }
    // Get web compiler for intercept AppHistoryFallback
    const compiler = server.compiler.compilers[0];
    const contextQueue = [];

    compiler.hooks.done.tapAsync('ApiHistoryCallback', (stats, callback) => {
      let context;
      afterCompiled = true;
      // eslint-disable-next-line
      while ((context = contextQueue.shift())) {
        const { entryName, res } = context;
        res.send(getHTML(entryName));
      }
      callback();
    });

    app.get(/^\/?(?!\.(js|css|json))/, (req, res, next) => {
      const matched = req.url.match(/^\/(\S*?)\.html/);
      if (!matched) {
        next();
        return;
      }
      const entryName = matched[1];
      if (afterCompiled) {
        res.send(getHTML(entryName));
      } else {
        contextQueue.push({
          res,
          entryName,
        });
      }
    });
  });
};
