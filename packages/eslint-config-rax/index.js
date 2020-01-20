module.exports = {
  extends: [
    './rules/globals',
    './rules/base',
    './rules/react',
    './rules/typescript'
  ].map(require.resolve),
  rules: {},
};