module.exports = {
  extends: [
    './rules/global',
    './rules/base',
    './rules/react',
  ].map(require.resolve),
  rules: {},
};