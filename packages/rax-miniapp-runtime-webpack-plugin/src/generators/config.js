const addFileToCompilation = require('../utils/addFileToCompilation');

module.exports = function(compilation, { usingComponents, usingPlugins, pages, target, command }) {
  const config = {
    usingComponents: {},
    usingPlugins: {},
    pages
  };

  if (process.env.DEBUG === 'true') {
    config.debug = true;
  }

  Object.keys(usingComponents).forEach(name => {
    config.usingComponents[name] = {
      props: usingComponents[name].props,
      events: usingComponents[name].events,
    };
  });

  Object.keys(usingPlugins).forEach(name => {
    config.usingPlugins[name] = {
      props: usingPlugins[name].props,
      events: usingPlugins[name].events,
    };
  });
  addFileToCompilation(compilation, {
    filename: 'config.js',
    content: `module.exports = ${JSON.stringify(config)}`,
    command,
    target,
  });
};
