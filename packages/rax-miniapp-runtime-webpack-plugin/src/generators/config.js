const addFileToCompilation = require('../utils/addFileToCompilation');

/**
 * Generate config js file
 * @param {Object} compilation webpack current compilation
 * @param {Object} usingComponents native components
 * @param {Array} pages all pages
 * @param {Object} param3 target/command which common options
 */
module.exports = function(compilation, usingComponents, pages, { target, command }) {
  const config = {
    usingComponents: {},
    pages
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
