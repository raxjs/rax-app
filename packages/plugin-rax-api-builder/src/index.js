const build = require('./build');

const pluginApiBuilder = (api, options = {}) => {
  const { context, onHook } = api;
  const { command, rootDir } = context;
  const { entry } = options;

  if (command === 'build') {
    onHook('after.build.compile', () => {
      build({ rootDir, entry });
      build({ rootDir, entry, outDir: 'dist', shouldMinify: true });
    });
  }
};

module.exports = pluginApiBuilder;
