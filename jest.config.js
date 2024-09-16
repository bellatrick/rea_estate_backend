/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js'],
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    testMatch: ['**/__tests__/**/*.test.(ts|js)'],
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig.json',
      },
    },
    testTimeout: 10000, // 10 seconds for all tests
  };
