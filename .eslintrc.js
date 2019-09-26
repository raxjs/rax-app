const { eslint, deepmerge } = require('@ice/spec');

module.exports = deepmerge(eslint, {
  "rules": {
    "global-require": 0,
    "no-bitwise": 0,
    "import/no-dynamic-require": 0,
    'no-await-in-loop': 0,
    "no-restricted-syntax": 0,
    "no-underscore-dangle": 0,
    "guard-for-in": 0,
    'indent': ['error', 2, {
      'SwitchCase': 1,
      'MemberExpression': 'off'
    }]
  }
});
