const babelJest = require('babel-jest');
const getBabelConfig = require('rax-babel-config');

const jestBabelConfig = getBabelConfig({ isNode: true });
module.exports = babelJest.createTransformer(jestBabelConfig);
