const { getBabelConfig } = require('rax-compile-config');

const babelConfig = getBabelConfig({
  styleSheet: true,
});

babelConfig.presets.push(require.resolve('@babel/preset-typescript'));
module.exports = require('babel-jest').createTransformer(babelConfig);
