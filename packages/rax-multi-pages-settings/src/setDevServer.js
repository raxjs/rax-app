const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const getEntries = require('./getEntries');

const MAIN_TEMPLATE = path.join(__dirname, './template/main.jsx.ejs');

module.exports = ({
  config,
  context,
  targets
}) => {
  if (process.env.RAX_SSR === 'true') return;
  const entries = getEntries(context);

  config.devServer.set('before', (app, devServer) => {
    const compiler = devServer.compiler.compilers[0];
    const templateContent = fs.readFileSync(MAIN_TEMPLATE, 'utf-8');

    app.get('/', function(req, res) {
      const content = ejs.render(templateContent, {
        entries,
        hasWeb: targets.includes('web'),
        hasWeex: targets.includes('weex'),
      });

      res.send(content);
    });

    if (targets.includes('web')) {
      let compilationAssets;
      const httpTaskQueue = [];

      compiler.hooks.emit.tap('AppHistoryFallback', function(compilation) {
        compilationAssets = compilation.assets;

        let task;
        // eslint-disable-next-line
        while (task = httpTaskQueue.shift()) {
          task();
        }
      });

      entries.forEach(({ entryName }) => {
        app.get(`/web/${entryName}.html`, function(req, res) {
          const assetPath = `web/${entryName}.html`;
          const send = () => {
            const content = compilationAssets[assetPath]
              ? compilationAssets[assetPath].source()
              : 'Document Not Found.';
            res.send(content);
          };

          if (compilationAssets) {
            send();
          } else {
            httpTaskQueue.push(send);
          }
        });
      });
    }
  });
};
