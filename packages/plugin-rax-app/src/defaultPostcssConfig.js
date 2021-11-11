/* eslint-disable no-case-declarations */
/* eslint-disable global-require */
const getPlugins = require('./getPostCssPlugin');

// See https://github.com/postcss/postcss-loader#context-ctx
module.exports = (options) => {
  const type = options && options.type;
  return {
    plugins: getPlugins(type),
  };
};
