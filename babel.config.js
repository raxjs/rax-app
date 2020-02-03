module.exports = {
  'presets': [
    '@babel/preset-flow',
    ['@babel/preset-env', {
      'loose': true
    }],
    ['@babel/preset-react', {
      'pragma': 'createElement'
    }]
  ]
};