const path = require('path');
const { existsSync } = require('fs-extra');

module.exports = {
  defaultValue: {},
  validation: 'object',
  configWebpack: (config, value, context) => {
    // "alias": {
    //   "@components": "src/components/",
    //   "react": "rax"
    // }
    Object.keys(value).forEach((alias) => {
      const maybePath = path.resolve(context.rootDir, value[alias]);
      if (existsSync(maybePath)) {
        config.resolve.alias.set(alias, maybePath);
      } else {
        config.resolve.alias.set(alias, value[alias]);
      }
    });
  },
};
