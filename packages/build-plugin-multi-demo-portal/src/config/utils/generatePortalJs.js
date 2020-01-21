const path = require('path');
const hbs = require('handlebars');
const fs = require('fs-extra');
const htmlDecode = require('js-htmlencode').htmlDecode;
const parseMd = require('./parseMarkdown');

const PORTAL_TMPL_PATH = path.resolve(__dirname, '../template/portal.hbs');

function compile(hbsPath) {
  const hbsTemplateContent = fs.readFileSync(hbsPath, 'utf-8');
  const compileTemplateContent = hbs.compile(hbsTemplateContent);

  return compileTemplateContent;
}

module.exports = function({
  filename = 'index.js',
  rootDir = process.cwd(),
  componentName = 'component',
  params,
}) {
  const compileTemplateContent = compile(PORTAL_TMPL_PATH);
  const readmeFilePath = path.resolve(rootDir, './README.md');
  const result = parseMd(componentName, readmeFilePath);
  const docHtml = result.body;

  const tempDir = path.join(rootDir, './node_modules');
  const jsPath = path.join(tempDir, filename);

  const jsTemplateContent = compileTemplateContent({
    ...params,
    title: result.meta.title,
    docHtml: htmlDecode(docHtml),
  });
  fs.writeFileSync(jsPath, jsTemplateContent);

  return jsPath;
};
