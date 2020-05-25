const { generateAppJS, generateAppCSS } = require('./app');
const generateConfig = require('./config');
const generateCustomComponent = require('./custom-component');
const {
  generatePageCSS,
  generatePageJS,
  generatePageJSON,
  generatePageXML,
} = require('./page');

module.exports = {
  generateAppCSS,
  generateAppJS,
  generateConfig,
  generateCustomComponent,
  generatePageCSS,
  generatePageJS,
  generatePageJSON,
  generatePageXML,
};
