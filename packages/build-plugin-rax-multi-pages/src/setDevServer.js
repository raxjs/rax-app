const path = require('path');
const fs = require('fs-extra');
const hbs = require('handlebars');

const MAIN_TEMPLATE = path.join(__dirname, './template/main.hbs');

module.exports = ({
  config,
  targets,
  entries,
}) => {
  config.devServer.set('before', (app, devServer) => {
    const compiler = devServer.compiler.compilers[0];

    app.get('/', function (req, res) {
      const hbsTemplateContent = fs.readFileSync(MAIN_TEMPLATE, 'utf-8');
      const compileTemplateContent = hbs.compile(hbsTemplateContent);
      const content = compileTemplateContent({
        entries,
        hasWeb: targets.includes('web'),
        hasWeex: targets.includes('weex'),
      });

      res.send(content);
    });

    if (targets.includes('web')) {
      let compilationAssets;
      const httpTaskQueue = [];

      compiler.hooks.emit.tap('AppHistoryFallback', function (compilation) {
        compilationAssets = compilation.assets;

        let task;
        // eslint-disable-next-line
        while (task = httpTaskQueue.shift()) {
          task();
        }
      });

      entries.forEach(({ entryName }) => {
        app.get(`/pages/${entryName}`, function (req, res) {
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
