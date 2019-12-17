const path = require('path');

module.exports = {
  defaultValue: 'build',
  validation: 'string',
  configWebpack: (config, value, context) => {
    const { rootDir } = context;

    config.output.path(path.resolve(rootDir, value));
  },
};