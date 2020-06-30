const adapter = require('../adapter');
const ejs = require('ejs');
const addFileToCompilation = require('../utils/addFileToCompilation');
const getTemplate = require('../utils/getTemplate');

function generateRootTmpl(
  compilation,
  { target, command, rootDir }
) {
  const template = ejs.render(getTemplate(rootDir, 'root.xml', target));
  addFileToCompilation(compilation, {
    filename: `root.${adapter[target].xml}`,
    content: template,
    target,
    command,
  });
}

module.exports = {
  generateRootTmpl
}
