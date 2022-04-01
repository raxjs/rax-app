const babelJest = require('babel-jest');
const getBabelConfig = require('rax-babel-config');

const jestBabelConfig = getBabelConfig();
module.exports = babelJest.createTransformer(jestBabelConfig);
