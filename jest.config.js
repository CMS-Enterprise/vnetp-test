module.exports = {
  globals: {
    'ts-jest': {
      astTransformers: {
        before: [
          'jest-preset-angular/build/InlineFilesTransformer',
          'jest-preset-angular/build/StripStylesTransformer',
        ],
      },
    },
  },
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setupJest.ts'],
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
  },
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  coverageReporters: ['text', 'cobertura', 'lcov'],
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
  moduleDirectories: ['', 'node_modules', 'src'],
  transformIgnorePatterns: ['node_modules/(?!lodash-es/*)'],
  testPathIgnorePatterns: [
    '<rootDir>/src/app/components/appcentric/appcentric.component.spec.ts',
    '<rootDir>/src/app/components/netcentric/netcentric.component.spec.ts',
    '<rootDir>/src/app/components/appcentric/appcentric-navbar/appcentric-navbar.component.spec.ts',
    '<rootDir>/src/app/components/appcentric/appcentric-dashboard/appcentric-dashboard.component.spec.ts',
    '<rootDir>/src/app/components/appcentric/appcentric-breadcrumbs/appcentric-breadcrumbs.component.spec.ts'
  ]
};
