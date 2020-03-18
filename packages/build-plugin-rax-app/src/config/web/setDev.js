const path = require('path');

// The HTML assets path is related to the webpack output filename.
// It is determined by webpack configuration, but not vary based on the operating system.
const HTMLAssetPath = 'web/index.html';

module.exports = (config, context, index, options) => {
  config.devServer.set('before', (app, devServer) => {
    const compiler = devServer.compiler.compilers[index];
    const httpResponseQueue = [];
    let fallbackHTMLContent;

    compiler.hooks.emit.tap('AppHistoryFallback', function(compilation) {
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
    const reg = options.webEntry || /^\/?((?!\.(js|html|css|json)).)*$/
    app.get(reg, function(req, res) {
      if (fallbackHTMLContent !== undefined) {
        res.send(fallbackHTMLContent);
      } else {
        httpResponseQueue.push(res);
      }
    });
  });
};
