const path = require('path');
const { MINIAPP, WECHAT_MINIPROGRAM } = require('../../../constants');

module.exports = {
  defaultValue: 'build',
  validation: 'string',
  configWebpack: (config, value, context) => {
    const { rootDir, taskName } = context;
    // Extract miniapp becasues output.path will be configured in miniapp config file.
    if ([ MINIAPP, WECHAT_MINIPROGRAM ].indexOf(taskName) === -1) {
      config.output.path(path.resolve(rootDir, value));
    }
  },
};
