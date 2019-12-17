const path = require('path');

module.exports = {
  defaultValue: 'lib',
  validation: 'string',
  configWebpack: (config, value, context) => {
    const { command, rootDir } = context;
    if (command === 'build') {
      config.output.path(path.resolve(rootDir, value));
    }
  },
};