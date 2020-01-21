const path = require('path');
const Module = require('module');
const { parse, print } = require('error-stack-tracey');

const getBaseWebpack = require('../getBaseWebpack');
const getDemos = require('../getDemos');

function exec(code, filename, filePath) {
  const module = new Module(filename, this);
  module.paths = Module._nodeModulePaths(filePath);
  module.filename = filename;
  module._compile(code, filename);
  return module.exports;
}

module.exports = (context, options) => {
  const config = getBaseWebpack(context);
  const { rootDir } = context;

  const demos = getDemos(rootDir, {
    type: 'node',
  });

  demos.forEach(({ name, filePath }) => {
    config
      .entry(name)
      .add(filePath);
  });

  config.target('node');

  config.output
    .path(rootDir)
    .libraryTarget('commonjs2');

  config.output.filename('ssr/[name].js');

  if (options.forceInline) {
    config.module
      .rule('css')
      .test(/\.css?$/)
      .use('css')
      .loader(require.resolve('stylesheet-loader'));

    config.module
      .rule('less')
      .test(/\.less?$/)
      .use('css')
      .loader(require.resolve('stylesheet-loader'))
      .end()
      .use('less')
      .loader(require.resolve('less-loader'));
  } else {
    config.plugins.delete('minicss');

    config.module.rules.delete('css');
    config.module.rule('css')
      .test(/\.css?$/)
      .use('ignorecss')
      .loader(require.resolve('./ignoreLoader'))
      .end();

    config.module.rules.delete('less');
    config.module.rule('less')
      .test(/\.less?$/)
      .use('ignorecss')
      .loader(require.resolve('./ignoreLoader'))
      .end();
  }

  config.devServer.set('before', (app, devServer) => {
    const outputFs = devServer.compiler.compilers[0].outputFileSystem;

    demos.forEach((demo) => {
      app.get(`/ssr/${demo.name}`, async function(req, res) {
        const query = req.query || {};
        // disable hydarte for debug http://localhost:9999/ssr/index?hydrate=false
        const hydrate = query.hydrate !== 'false';

        const bundleContent = outputFs.readFileSync(path.join(rootDir, `ssr/${demo.name}.js`), 'utf8');

        let content;

        try {
          const mod = exec(bundleContent, demo.filePath, demo.filePath);
          content = mod.default();
        } catch (error) {
          const errorStack = await parse(error, bundleContent);
          print(error.message, errorStack);

          const stackMessage = errorStack.map(frame => frame.source);
          content = `Error: ${error.message}<br>${stackMessage.join('<br>')}`;
        }

        const existsCSS = outputFs.existsSync(path.join(rootDir, `${demo.name}.css`));
        const style = existsCSS ? `<link href="/${demo.name}.css" rel="stylesheet"></head>` : '';
        const srcipt = hydrate ? `<script type="text/javascript" src="/${demo.name}.js"></script>` : '';

        const html = `
          <!doctype html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, minimum-scale=1, user-scalable=no">
              <title>Rax Component Demo</title>
              ${style}
            </head>
            <body style="padding: 0;margin: 0">
              ${content}
              ${srcipt}
            </body>
          </html>`;
          res.send(html);
      });
    });
  });

  return config;
};
