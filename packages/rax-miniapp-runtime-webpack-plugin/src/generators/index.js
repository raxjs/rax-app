const { generateAppJS, generateAppCSS } = require('./app');
const generateConfig = require('./config');
const {
  generatePageCSS,
  generatePageJS,
  generatePageJSON,
  generatePageXML,
} = require('./page');
const { generateRootTmpl } = require('./root');
const {
  generateElementJS,
  generateElementJSON,
  generateElementTemplate,
} = require('./element');
const generateRender = require('./render');
const generatePkg = require('./pkg');

module.exports = {
  generateAppCSS,
  generateAppJS,
  generateConfig,
  generatePageJS,
  generatePageJSON,
  generatePageXML,
  generateRootTmpl,
  generateElementJS,
  generateElementJSON,
  generateElementTemplate,
  generateRender,
  generatePkg
};
