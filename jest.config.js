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
      // branches: 90,
      // functions: 90,
      // lines: 90,
      // statements: 90,
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
