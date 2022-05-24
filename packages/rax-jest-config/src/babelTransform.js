const babelJest = require('babel-jest');
const getBabelConfig = require('rax-babel-config');

const jestBabelConfig = getBabelConfig({
  modules: 'auto',
});
module.exports = babelJest.createTransformer(jestBabelConfig);
