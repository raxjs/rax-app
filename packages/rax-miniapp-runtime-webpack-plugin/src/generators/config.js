const addFileToCompilation = require('../utils/addFileToCompilation');

module.exports = function(compilation, options = {}, { target, command }) {
  const exportedConfig = {
    optimization: options.optimization || {},
    nativeCustomComponent:
      options.config && options.config.nativeCustomComponent,
    debug: options.config && options.config.debug,
  };
  addFileToCompilation(compilation, {
    filename: 'config.js',
    content: `module.exports = ${JSON.stringify(exportedConfig)}`,
    command,
    target,
  });
};
