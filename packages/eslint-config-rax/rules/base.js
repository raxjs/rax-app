module.exports = {
  'parser': 'babel-eslint',
  'env': {
    'browser': true,
    'node': true,
    'es6': true,
    'jest': true,
    'commonjs': true,
  },
  'plugins': [
    'import',
    'module',
  ],
  'parserOptions': {
    'sourceType': 'module',
    'ecmaVersion': 6,
    'ecmaFeatures': {
      'jsx': true,
      'generators': true,
      'experimentalObjectRestSpread': true,
    },
  },
  'settings': {},
  'rules': {
    /**
     * ES6
     */
    'no-const-assign': 'error',
    'no-class-assign': 'error',
    'no-dupe-class-members': 'error',
    'rest-spread-spacing': 'error',
    'no-duplicate-imports': 'error',
    'no-useless-rename': 'error',
    'arrow-spacing': 'error',
    'no-useless-computed-key': 'error',
    'template-curly-spacing': 'error',
    'generator-star-spacing': ['error', {'before': false, 'after': true}],
    'yield-star-spacing': ['error', {'before': false, 'after': true}],
    'no-undef': 'error',
    'dot-notation': ['error', {
      'allowKeywords': true,
    }],
    'no-extend-native': 'error',
    'no-native-reassign': 'error',
    'no-constant-condition': ['error', {
      'checkLoops': false,
    }],
    'no-caller': 'error',
    'no-return-assign': 'off',
    'no-loop-func': 'off',
    'strict': ['off', 'global'],
    'global-strict': ['off', 'always'],
    'no-extra-strict': 'off',
    'no-shadow': 'off',
    'no-unused-vars': ['off', {
      'vars': 'local',
      'args': 'after-used',
      'varsIgnorePattern': 'createElement',
    }],
    'no-unused-expressions': 'off',
    'no-use-before-define': 'off',
    'no-array-constructor': 'off',
    'yoda': 'off',
    'eqeqeq': 'off',
    'no-new': 'off',
    'consistent-return': 'off',
    'prefer-const': 'off',
    /**
     * Node.js
     */
    'no-catch-shadow': 'error',
    'quotes': ['error', 'single', 'avoid-escape'],
    'brace-style': ['error', '1tbs', {
      'allowSingleLine': false,
    }],
    'comma-spacing': ['error', {
      'before': false,
      'after': true,
    }],
    'comma-style': ['error', 'last'],
    'new-cap': ['error', {
      'newIsCap': true,
      'capIsNew': false
    }],
    'key-spacing': ['error', {
      'beforeColon': false,
      'afterColon': true,
    }],
    'no-mixed-spaces-and-tabs': 'error',
    'no-multi-spaces': 'error',
    'no-multiple-empty-lines': 'error',
    'no-new-object': 'error',
    'no-spaced-func': 'error',
    'no-tabs': 'error',
    'no-trailing-spaces': 'error',
    'no-extra-parens': ['error', 'all', { ignoreJSX: 'all' }],
    'padded-blocks': ['error', 'never'],
    'semi': 'error',
    'semi-spacing': 'error',
    'keyword-spacing': 'error',
    'space-before-blocks': 'error',
    'space-before-function-paren': ['error', {
      anonymous: 'never',
      named: 'never',
      asyncArrow: 'always',
    }],
    'space-infix-ops': 'error',
    'spaced-comment': ['error', 'always', {
      'line': {
        'markers': ['/'],
        'exceptions': ['-', '+'],
      },
      'block': {
        'markers': ['!'],
        'exceptions': ['*'],
        'balanced': true,
      },
    }],
    'no-console': 'off',
    'no-new-require': 'off',
    'no-mixed-requires': ['off', false],
    'no-path-concat': 'off',
    'handle-callback-err': 'off',
    'eol-last': 'off',
    'func-names': 'off',
    'no-empty': 'off',
    'indent': ['error', 2, {
      'SwitchCase': 1,
    }],
    'camelcase': ['off', {
      'properties': 'always',
    }],

    /**
     * Import
     */
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/no-extraneous-dependencies': [
      'error',
      {
        'peerDependencies': true,
        'devDependencies': [
          '**/scripts/*.js',
          '**/scripts/**/*.js',
          '**/__tests__/*.js',
          '**/__tests__/**/*.js',
          '**/*.config.js',
          '**/config/*.js',
          '**/*.conf.js',
          '**/tests/*.test.js',
          '**/demo/**'
        ],
      },
    ],
    'module/no-implicit-dependencies': ['error', {
      'peerDependencies': true,
      'devDependencies': [
        '**/scripts/*.js',
        '**/scripts/**/*.js',
        '**/__tests__/*.js',
        '**/__tests__/**/*.js',
        '**/*.config.js',
        '**/config/*.js',
        '**/*.conf.js',
        '**/tests/*.test.js',
        '**/demo/**'
      ]
    }]
  },
};
