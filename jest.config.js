// jest.config.js

module.exports = {
  'collectCoverage': true,
  'verbose': true,
  'testPathIgnorePatterns': [
    '/node_modules/',
    '/fixtures/',
    '/__modules__/',
    '/__files__/',
    '/lib/',
    '/dist/',
    '/es/',
  ]
};
