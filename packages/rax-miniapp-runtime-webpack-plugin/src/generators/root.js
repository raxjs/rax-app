const adapter = require('../adapter');
const ejs = require('ejs');
const addFileToCompilation = require('../utils/addFileToCompilation');
const getTemplate = require('../utils/getTemplate');

function generateRootTemplate(
  compilation,
  { target, command, rootDir }
) {
  const template = ejs.render(getTemplate(rootDir, target, 'root.xml'));
  addFileToCompilation(compilation, {
    filename: `root.${adapter[target].xml}`,
    content: template,
    target,
    command,
  });
}

module.exports = {
  generateRootTemplate,
};
