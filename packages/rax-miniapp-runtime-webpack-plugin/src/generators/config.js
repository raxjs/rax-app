const addFileToCompilation = require('../utils/addFileToCompilation');

module.exports = function(compilation, usingComponents, { target, command }) {
  const config = {
    usingComponents: {}
  };

  if (process.env.DEBUG === 'true') {
    config.debug = true;
  }

  Object.keys(usingComponents).forEach(name => {
    config.usingComponents[name] = {
      props: usingComponents[name].props,
      events: usingComponents[name].events
    };
  });
  addFileToCompilation(compilation, {
    filename: 'config.js',
    content: `module.exports = ${JSON.stringify(config)}`,
    command,
    target,
  });
};
