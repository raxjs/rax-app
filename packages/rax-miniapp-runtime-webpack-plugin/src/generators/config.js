const addFileToCompilation = require('../utils/addFileToCompilation');

module.exports = function(compilation, usingComponents, { target, command }) {
  const config = {};
  Object.keys(usingComponents).forEach(name => {
    config[name] = {
      props: usingComponents[name].props,
      events: usingComponents[name].events
    };
  });
  addFileToCompilation(compilation, {
    filename: 'config.js',
    content: `module.exports = ${JSON.stringify(usingComponents)}`,
    command,
    target,
  });
};
