module.exports = {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setupJest.ts'],
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
  },
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  coverageReporters: ['text', 'cobertura'],
  coverageThreshold: {
    global: {
      branches: 21,
      functions: 31,
      lines: 41,
      statements: 43,
    },
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '**/src/**/*.ts',
    '!**/node_modules/**',
    '!**/src/**/*.module.ts',
    '!**/src/test/**',
    '!**/polyfills.ts',
    '!**/environments/**',
    '!**/src/setupJest.ts',
  ],
  moduleDirectories: ["", "node_modules", "src"],
  transformIgnorePatterns: ['node_modules/(?!lodash-es/*)'],
  verbose: true,
};
