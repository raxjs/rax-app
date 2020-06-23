const ejs = require('ejs');
const { MINIAPP } = require('../constants');
const adapter = require('../adapter');
const addFileToCompilation = require('../utils/addFileToCompilation');
const getTemplate = require('../utils/getTemplate');

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
  addFileToCompilation(compilation, {
    filename: `comp.${adapter[target].xml}`,
    content: `${target !== MINIAPP ?
      '<import src="./root.${adapter[target].xml}"/>' :
      ejs.render(getTemplate(rootDir, 'root.xml', target))}

    <template is="{{r.behavior || 'element'}}" data="{{r: r, isComp: true}}" />`,
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
