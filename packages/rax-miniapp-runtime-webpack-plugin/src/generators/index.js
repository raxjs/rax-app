const { generateAppJS, generateAppCSS } = require('./app');
const generateConfig = require('./config');
const generateCustomComponent = require('./custom-component');
const {
  generatePageCSS,
  generatePageJS,
  generatePageJSON,
  generatePageXML,
} = require('./page');
const { generateRootTemplate } = require('./root');

module.exports = {
  generateAppCSS,
  generateAppJS,
  generateConfig,
  generateCustomComponent,
  generatePageCSS,
  generatePageJS,
  generatePageJSON,
  generatePageXML,
  generateRootTemplate
};
