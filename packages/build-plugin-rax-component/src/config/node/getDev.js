const path = require('path');

const getBaseWebpack = require('../getBaseWebpack');
const getDemos = require('../getDemos');

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
  
  // TODO: support debug 
  // TODO: error sourcemap
  // TODO: refactor read file from output fs
  config.devServer.set('before', (app, devServer) => {
    const outputFs = devServer.compiler.compilers[0].outputFileSystem;

    demos.forEach((demo) => {
      app.get(`/ssr/${demo.name}`, function(req, res) {

        const query = req.query || {};
        const hydrate = query.hydrate === 'false';

        const bundleContent = outputFs.readFileSync(path.join(rootDir, `ssr/${demo.name}.js`), 'utf8');
        const mod = eval(bundleContent); // eslint-disable-line

        const content = mod.default();

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
