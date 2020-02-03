module.exports = {
  'presets': [
    [
      '@babel/preset-env',
      {
        'loose': true,
        'targets': {
          'node': 'current',
        },
      },

    ],
  ],
  'plugins': [
    'babel-plugin-transform-jsx-to-html',
    '@babel/plugin-transform-react-jsx'
  ]
};

