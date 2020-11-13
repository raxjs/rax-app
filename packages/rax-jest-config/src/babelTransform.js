const babelJest = require('babel-jest');
const { getBabelConfig } = require('build-scripts-config');

const jestBabelConfig = getBabelConfig();
module.exports = babelJest.createTransformer(jestBabelConfig);
