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
      const fullPath = path.resolve(context.rootDir, value[alias]);
      if (existsSync(fullPath)) {
        config.resolve.alias.set(alias, fullPath);
      } else {
        config.resolve.alias.set(alias, value[alias]);
      }
    });
  },
};
