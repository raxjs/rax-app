const path = require('path');

module.exports = (applyMethod) => {
  applyMethod('addTemplateDir', path.join(__dirname, 'templates'));
};
