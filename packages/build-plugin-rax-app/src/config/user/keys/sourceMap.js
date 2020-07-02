const { DOCUMENT } = require('../../../constants');

module.exports = {
  validation: (val) => {
    return typeof val === 'boolean' || typeof val === 'string';
  },
  configWebpack: (config, value, context) => {
    const { command, taskName } = context;
    // Only valid in build mode and non-document task
    if (command === 'build' && taskName !== DOCUMENT) {
      if (typeof value === 'boolean') {
        value ? config.devtool('source-map') : config.devtool('none');
      } else if (typeof value === 'string') {
        config.devtool(value);
      }
    }
  },
};
