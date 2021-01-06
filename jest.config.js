module.exports = {
  coverageDirectory: './coverage/',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['packages/*/lib/*.{js,jsx}'],
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
  ],
  roots: [
    '<rootDir>/packages',
    '<rootDir>/__tests__',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/lib/',
    '/utils/',
  ],
  preset: 'ts-jest',
};
