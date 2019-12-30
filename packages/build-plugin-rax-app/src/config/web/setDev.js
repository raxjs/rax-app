const path = require('path');

module.exports = (config, context) => {
  const { rootDir, userConfig } = context;
  const { outputDir } = userConfig;

  // history fall back
  const htmlPath = path.resolve(rootDir, outputDir, 'web/index.html');

  config.devServer.set('before', (app, devServer) => {
    const compiler = devServer.compiler.compilers[0];
    const memFs = compiler.outputFileSystem;

    // not match .js .html files
    app.get(/^\/?((?!\.(js|html|css|json)).)*$/, function handleResponse(req, res) {
      if (memFs.existsSync(htmlPath)) {
        const outPut = memFs.readFileSync(htmlPath).toString();
        res.send(outPut);
      } else {
        setTimeout(() => {
          compiler.hooks.done.tap('sendHtml', handleResponse.bind(this, req, res));
        }, 500);
      }
    });
  });
};
