const adapter = require('../adapter');
const addFileToCompilation = require('../utils/addFileToCompilation');

function generateElementJS(compilation,
  { target, command, rootDir }) {
  addFileToCompilation(compilation, {
    filename: 'comp.js',
    content: `const render = require('miniapp-render');

    Component(render.createElementConfig());`,
    target,
    command,
  });
}

function generateElementTemplate(compilation,
  { target, command, rootDir }) {
  addFileToCompilation(compilation, {
    filename: `comp.${adapter[target].xml}`,
    content: `<import src="./root.${adapter[target].xml}"/>

    <template is="element" data="{{r: r, isComp: true}}" />`,
    target,
    command,
  });
}

function generateElementJSON(compilation,
  { target, command, rootDir }) {
  addFileToCompilation(compilation, {
    filename: 'comp.json',
    content: `{
      "component": true,
      "usingComponents": {
        "element": "./comp"
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
