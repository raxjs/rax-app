const { eslint, deepmerge } = require('@ice/spec');

module.exports = deepmerge(eslint, {
  "rules": {
    'no-await-in-loop': 0,
    "no-restricted-syntax": 0,
    "no-underscore-dangle": 0
  }
});
