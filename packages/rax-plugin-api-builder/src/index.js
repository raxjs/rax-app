const build = require('./build');

const pluginApp = (api, options = {}) => {
  const { context, onHook } = api;
  const { command, rootDir } = context;
  const { entry } = options;

  if (command === 'build') {
    onHook('after.build', () => {
      build({ rootDir, entry });
      build({ rootDir, entry, outDir: 'dist', shouldMinify: true });
    });
  }
};

module.exports = pluginApp;
