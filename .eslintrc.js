module.exports = {
  extends: ['rax'],
  plugins: ['rax'],
  rules: {
    'rax/no-implicit-dependencies': ['error', {
      'peerDependencies': true,
      'devDependencies': [
        '**/scripts/*.js',
        '**/__tests__/*.js',
        '**/__tests__/**/*.js',
        '**/*.config.js',
        '**/config/*.js',
        '**/*.conf.js',
        '**/tests/*.test.js',
        '**/demo/**'
      ],
      'whitelist': ['@generated']
    }]
  }
};
