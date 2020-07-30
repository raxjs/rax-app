const addFileToCompilation = require('../utils/addFileToCompilation');

module.exports = function(compilation, { usingComponents, usingPlugins, target, command }) {
  const config = {
    usingComponents: {},
    usingPlugins: {}
  };

  if (process.env.DEBUG === 'true') {
    config.debug = true;
  }

  Object.keys(usingComponents).forEach(name => {
    config.usingComponents[name] = {
      props: usingComponents[name].props,
      events: usingComponents[name].events,
      children: usingComponents[name].children
    };
  });

  Object.keys(usingPlugins).forEach(name => {
    config.usingPlugins[name] = {
      props: usingPlugins[name].props,
      events: usingPlugins[name].events,
      children: usingPlugins[name].children
    };
  });
  addFileToCompilation(compilation, {
    filename: 'config.js',
    content: `module.exports = ${JSON.stringify(config)}`,
    command,
    target,
  });
};
