const path = require('path');
const fs = require('fs-extra');
const hbs = require('handlebars');

const MAIN_TEMPLATE = path.join(__dirname, '../template/main.hbs');

module.exports = (config) => {
  const hbsTemplateContent = fs.readFileSync(MAIN_TEMPLATE, 'utf-8');
  const compileTemplateContent = hbs.compile(hbsTemplateContent);
  const resultContent = compileTemplateContent(config);
  
  return resultContent;
};
