// eslint-disable-next-line no-undef
globalThis.ngJest = {
  skipNgcc: false,
  tsconfig: 'tsconfig.spec.json',
};

module.exports = {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setupJest.ts'],
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
  },
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 69,
      functions: 79,
      lines: 83,
      statements: 83,
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
    '!**/src/main.ts',
  ],
  moduleDirectories: [__dirname, 'node_modules', 'src'],
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
};
