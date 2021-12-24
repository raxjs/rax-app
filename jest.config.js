const { getHookFiles } = require('./packages/rax-app/lib/require-hook');

const moduleNameMapper = getHookFiles().reduce((mapper, [id, value]) => {
  mapper[`^${id}$`] = value;
  return mapper;
}, {});


module.exports = {
  moduleNameMapper,
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
