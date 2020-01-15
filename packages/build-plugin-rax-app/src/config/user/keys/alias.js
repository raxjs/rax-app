const path = require('path');

module.exports = {
  defaultValue: {},
  validation: 'object',
  configWebpack: (config, value, context) => {
    // "alias": {
    //   "@components": "src/components/"
    // }
    Object.keys(value).forEach((alias) => {
      config.resolve.alias.set(alias, path.resolve(context.rootDir, value[alias]));
    });
  },
};
