module.exports = {
  extends: [
    './rules/global',
    './rules/base',
    './rules/react',
    './rules/typescript'
  ].map(require.resolve),
  rules: {},
};