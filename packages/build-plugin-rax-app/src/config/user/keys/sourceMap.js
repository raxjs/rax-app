const { DOCUMENT } = require('../../../constants');

module.exports = {
  defaultValue: '', // Do not set defaultValue, so other plugin can get actual user config for sourcemap
  validation: 'string',
  configWebpack: (config, value, context) => {
    const { command, taskName } = context;

    // Only valid in build mode and non-document task
    if (command === 'build' && taskName !== DOCUMENT) {
      config.devtool(value);
    }
  },
};
