const adapter = require('../adapter');
const ejs = require('ejs');
const addFileToCompilation = require('../utils/addFileToCompilation');
const getTemplate = require('../utils/getTemplate');

function generateRootTmpl(
  compilation,
  { usingPlugins, usingComponents, staticTmpls = [], target, command, rootDir }
) {
  const template = ejs.render(getTemplate(rootDir, 'root.xml', target));
  const pluginTmpl = ejs.render(getTemplate(rootDir, 'plugin.xml', target), {
    usingPlugins
  });
  const componentTmpl = ejs.render(getTemplate(rootDir, 'custom-component.xml', target), {
    usingComponents
  });

  const staticTmpl = ejs.render(getTemplate(rootDir, 'static.xml', target), {
    staticTmpls
  });
  addFileToCompilation(compilation, {
    filename: `root.${adapter[target].xml}`,
    content: template + pluginTmpl + componentTmpl + staticTmpl,
    target,
    command,
  });
  addFileToCompilation(compilation, {
    filename: `tool.${adapter[target].script}`,
    content: ejs.render(getTemplate(rootDir, `tool.${adapter[target].script}`, target)),
    target,
    command,
  });
}

module.exports = {
  generateRootTmpl
};
