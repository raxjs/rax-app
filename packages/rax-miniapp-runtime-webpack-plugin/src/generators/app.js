const { resolve, relative } = require('path');
const { readFileSync } = require('fs-extra');
const ejs = require('ejs');
const adapter = require('../adapter');
const { MINIAPP } = require('../constants');
const addFileToCompilation = require('../utils/addFileToCompilation');
const getAssetPath = require('../utils/getAssetPath');
const adjustCSS = require('../utils/adjustCSS');

function generateAppJS(
  compilation,
  commonAppJSFilePaths,
  { target, command, rootDir }
) {
  const appJsTmpl = readFileSync(
    resolve(rootDir, 'templates', 'app.js.ejs'),
    'utf-8'
  );
  const appJsContent = ejs.render(appJsTmpl, {
    init: `function init(window, document) {${commonAppJSFilePaths
      .map(
        filePath =>
          `require('${getAssetPath(
            filePath,
            'app.js'
          )}')(window, document)`
      )
      .join(';')}}`,
    isMiniApp: target === MINIAPP
  });
  addFileToCompilation(compilation, {
    filename: 'app.js',
    content: appJsContent,
    target,
    command,
  });
}

function generateAppCSS(compilation, { target, command, rootDir }) {
  // Add default css file to compilation
  const defaultCSSTmpl = adjustCSS(readFileSync(
    resolve(rootDir, 'templates', 'default.css.ejs'),
    'utf-8'
  ));
  addFileToCompilation(compilation, {
    filename: `default.${adapter[target].css}`,
    content: defaultCSSTmpl,
    target,
    command,
  });

  delete compilation.assets[`${target}/app.css`];

  let content = '@import "./default";';

  if (compilation.assets[`${target}/index.css`]) {
    content += '@import "./index.css";';
    delete compilation.assets[`${target}/index.css`];
  }

  addFileToCompilation(compilation, {
    filename: `app.${adapter[target].css}`,
    content,
    target,
    command,
  });
}

module.exports = {
  generateAppJS,
  generateAppCSS
};
