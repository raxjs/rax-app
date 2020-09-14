const CONFIG = {
  "process": false,
  "global": false
};

/**
 * support disable mock node env
 * https://webpack.js.org/configuration/node/
 */
module.exports = {
  defaultValue: true,
  validation: 'boolean',
  configWebpack: (config, value, context) => {
    const { command } = context;

    if (value === false) {
      Object.keys(CONFIG).map(key => {
        config.node
          .set(key, CONFIG[key]);
      });
    }
    config.optimization.minimize(false);
  },
};
