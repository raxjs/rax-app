const path = require('path');
const fs = require('fs-extra');
const hbs = require('handlebars');

const MAIN_TEMPLATE = path.join(__dirname, './template/main.hbs');

module.exports = ({
  config,
  context,
  targets,
  entries,
}) => {
  const { rootDir, userConfig } = context;
  const { outputDir } = userConfig;

  config.devServer.set('before', (app, devServer) => {
    const compiler = devServer.compiler.compilers[0];
    const memFs = compiler.outputFileSystem;

    app.get('/', function(req, res) {
      const hbsTemplateContent = fs.readFileSync(MAIN_TEMPLATE, 'utf-8');
      const compileTemplateContent = hbs.compile(hbsTemplateContent);
      const resultContent = compileTemplateContent({
        entries,
        hasWeb: targets.includes('web'),
        hasWeex: targets.includes('weex'),
      });

      res.send(resultContent);
    });

    if (targets.includes('web')) {
      entries.forEach(({ entryName }) => {
        app.get(`/pages/${entryName}`, function(req, res) {
          const htmlPath = path.resolve(rootDir, outputDir, `web/${entryName}.html`);
          if (memFs.existsSync(htmlPath)) {
            const outPut = memFs.readFileSync(htmlPath).toString();
            res.send(outPut);
          } else {
            compiler.hooks.done.tap(`${entryName}SendHtml`, () => {
              fs.pathExists(htmlPath, function(exists) {
                const outPut = memFs.readFileSync(htmlPath).toString();
                res.send(outPut);
              });
            });
          }
        });
      });
    }
  });
};
