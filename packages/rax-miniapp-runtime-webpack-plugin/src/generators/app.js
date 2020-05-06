const { resolve, relative } = require('path');
const { readFileSync } = require('fs-extra');
const ejs = require('ejs');
const { RawSource } = require('webpack-sources');
const adapter = require('../adapter');
const { VENDOR_CSS_FILE_NAME, MINIAPP } = require('../constants');
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
    'utf8'
  );
  const appJsContent = ejs.render(appJsTmpl, {
    init: `function init(window) {${commonAppJSFilePaths
      .map(
        filePath =>
          `require('${getAssetPath(
            relative(target, filePath),
            'app.js'
          )}')(window)`
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
    'utf8'
  ));
  addFileToCompilation(compilation, {
    filename: `default.${adapter[target].css}`,
    content: defaultCSSTmpl,
    target,
    command,
  });
  let appCssContent = '@import "./default";';
  // If inlineStyle is set to false, css file will be extracted to vendor.css
  const extractedAppCSSFilePath = `${target}/${VENDOR_CSS_FILE_NAME}`;
  if (compilation.assets[extractedAppCSSFilePath]) {
    compilation.assets[
      `${extractedAppCSSFilePath}.${adapter[target].css}`
    ] = new RawSource(
      adjustCSS(compilation.assets[extractedAppCSSFilePath].source())
    );
    delete compilation.assets[extractedAppCSSFilePath];
    appCssContent += `\n@import "./${VENDOR_CSS_FILE_NAME}";`;
  }

  delete compilation.assets[`${target}/app.css`];

  addFileToCompilation(compilation, {
    filename: `app.${adapter[target].css}`,
    content: appCssContent,
    target,
    command,
  });
}

module.exports = {
  generateAppJS,
  generateAppCSS
};
