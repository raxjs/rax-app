const ejs = require('ejs');
const { MINIAPP } = require('../constants');
const adapter = require('../adapter');
const addFileToCompilation = require('../utils/addFileToCompilation');
const getTemplate = require('../utils/getTemplate');
const { generateRootTmpl } = require('./root');

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

function generateElementTemplate(compilation, usingPlugins,
  { target, command, rootDir }) {
  let content = '<template is="{{r.behavior || \'element\'}}" data="{{r: r, isComp: true}}" />';
  if (target !== MINIAPP) {
    generateRootTmpl(compilation, usingPlugins, { target, command, rootDir });
    content = `<import src="./root.${adapter[target].xml}"/>` + content;
  } else {
    const pluginTmpl = ejs.render(getTemplate(rootDir, 'plugin.xml', target), {
      usingPlugins
    });
    // In MiniApp, root.axml need be written into comp.axml
    content = ejs.render(getTemplate(rootDir, 'root.xml', target))
    + pluginTmpl
    + content;
  }
  addFileToCompilation(compilation, {
    filename: `comp.${adapter[target].xml}`,
    content,
    target,
    command,
  });
}

function generateElementJSON(compilation, useNativeComponent, usingPlugins,
  { target, command, rootDir }) {
    const content = {
      component: true,
      usingComponents: {}
    };
    if (useNativeComponent) {
      content.usingComponents['custom-component'] = './custom-component/index';
    }
    if (target !== MINIAPP) {
      content.usingComponents['element'] = './comp';
    }
    Object.keys(usingPlugins).forEach(plugin => {
      content.usingComponents[plugin] = usingPlugins[plugin].path;
    });

  addFileToCompilation(compilation, {
    filename: 'comp.json',
    content: JSON.stringify(content, null, 2),
    target,
    command,
  });
}

module.exports = {
  generateElementTemplate,
  generateElementJS,
  generateElementJSON
};
