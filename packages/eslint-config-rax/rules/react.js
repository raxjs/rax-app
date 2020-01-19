module.exports = {
  'plugins': [
    'react',
  ],
  'settings': {
    'react': {
      'pragma': 'createElement', // Pragma to use, default to "React"
      'pragmaFrag': 'Fragment',
    },
  },
  'rules': {
    /**
     * React & JSX
     */
    'jsx-quotes': ['error', 'prefer-double'],
    'react/jsx-no-bind': ['error', {
      'allowArrowFunctions': true,
    }],
    'react/prefer-es6-class': 'error',
    'react/jsx-curly-spacing': 'error',
    'react/jsx-indent-props': ['error', 2], // 2 spaces indentation
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-tag-spacing': 'error',
    'react/jsx-no-comment-textnodes': 'error',
    'react/jsx-equals-spacing': 'error',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/no-is-mounted': 'error',
    'react/no-children-prop': 'error',
    'react/no-did-mount-set-state': 'error',
    'react/no-did-update-set-state': 'error',
    'react/style-prop-object': 'error',
    'react/react-in-jsx-scope': 'error',
    // Avoid throw lint error like <script src="path"></script>
    'react/self-closing-comp': ['error', {
      'html': false
    }],
    'react/display-name': 'off',
    'react/jsx-boolean-value': ['off', 'always'],
    'react/jsx-handler-names': 'off',
    'react/no-unknown-property': 'off',
    'react/sort-comp': ['off', {
      'order': [
        'lifecycle',
        '/^on.+$/',
        '/^(get|set)(?!(InitialState$|DefaultProps$|ChildContext$)).+$/',
        'everything-else',
        '/^render.+$/',
        'render',
      ],
    }],
  },
};
