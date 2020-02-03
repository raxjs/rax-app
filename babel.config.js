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
    [
      '@babel/preset-react',
      {
        'pragma': 'createElement'
      }
    ]
  ]
};
