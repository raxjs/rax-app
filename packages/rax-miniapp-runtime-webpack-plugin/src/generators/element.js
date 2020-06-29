const ejs = require('ejs');
const { MINIAPP } = require('../constants');
const adapter = require('../adapter');
const addFileToCompilation = require('../utils/addFileToCompilation');
const getTemplate = require('../utils/getTemplate');
const generateRootTmpl = require('./root');

function generateElementJS(compilation,
  { target, command, rootDir }) {
  addFileToCompilation(compilation, {
    filename: 'comp.js',
    content: `const render = require('./render');

    Component(render.createElementConfig());`,
    target,
    command,
  });
}

function generateElementTemplate(compilation,
  { target, command, rootDir }) {
  let content = '<template is="{{r.behavior || \'element\'}}" data="{{r: r, isComp: true}}" />';
  if (target !== MINIAPP) {
    generateRootTmpl(compilation,
      { target, command, rootDir });
    content = '<import src="./root.${adapter[target].xml}"/>' + content;
  } else {
    // In MiniApp, root.axml need be written into comp.axml
    content = ejs.render(getTemplate(rootDir, 'root.xml', target)) + content;
  }
  addFileToCompilation(compilation, {
    filename: `comp.${adapter[target].xml}`,
    content,
    target,
    command,
  });
}

function generateElementJSON(compilation, useNativeComponent,
  { target, command, rootDir }) {
  addFileToCompilation(compilation, {
    filename: 'comp.json',
    content: `{
      "component": true,
      "usingComponents": {
        ${useNativeComponent ? '"custom-component": "./custom-component/index"' : ''}
        ${target !== MINIAPP ? ',"element": "./comp"' : ''}
      }
    }`,
    target,
    command,
  });
}

module.exports = {
  generateElementTemplate,
  generateElementJS,
  generateElementJSON
};
