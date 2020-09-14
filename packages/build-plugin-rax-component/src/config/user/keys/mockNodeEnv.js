const CONFIG = {
  process: false,
  global: false
};

/**
 * support disable mock node env
 * https://webpack.js.org/configuration/node/
 */
module.exports = {
  defaultValue: true,
  validation: (val) => {
    return typeof val === 'boolean' || typeof val === 'object';
  },
  configWebpack: (config, value, context) => {
    const { command } = context;

    if (value === false) {
      Object.keys(CONFIG).map(key => {
        config.node
          .set(key, CONFIG[key]);
      });
    } else if (typeof value === 'object') {
      Object.keys(value).map(key => {
        config.node
          .set(key, value[key]);
      });
    }
  },
};
