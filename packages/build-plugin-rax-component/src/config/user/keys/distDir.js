const path = require('path');

// module.exports = (config, context, value) => {
//   const { rootDir } = context;

//   config.output.path(path.resolve(rootDir, value));
// };


module.exports = {
  defaultValue: '/',
  validation: 'string',
  configWebpack: (config, value, context) => {
    const { rootDir } = context;
    config.output.path(path.resolve(rootDir, value));
  },
};