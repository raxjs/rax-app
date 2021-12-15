const { getESLintConfig } = require('@iceworks/spec');

// https://www.npmjs.com/package/@iceworks/spec
module.exports = getESLintConfig('rax-ts', {
  parserOptions: {
    project: [],
    createDefaultProgram: false,
  },
  rules: {
    'no-useless-escape': 'off',
    'no-console': 'off',
    'no-param-reassign': 'off',
    'max-len': 'off',
    '@typescript-eslint/restrict-plus-operands': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@iceworks/best-practices/no-js-in-ts-project': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/restrict-plus-operands': 'off',
    '@typescript-eslint/dot-notation': 'off',
  },
});
