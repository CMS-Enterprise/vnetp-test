module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setupJest.ts'],
  testPathIgnorePatterns : [
    "<rootDir>/src/test.ts",
    "<rootDir>/src/app/components/solaris/solaris.component.spec.ts",
    "<rootDir>/src/app/components/solaris/cdom-detail/cdom-detail.component.spec.ts",
    "<rootDir>/src/app/components/solaris/ldom-detail/ldom-detail.component.spec.ts",
    "<rootDir>/src/app/components/solaris/ldom-list/ldom-list.component.spec.ts",
    "<rootDir>/src/app/components/solaris/solaris-cdom-create/solaris-cdom-create.component.spec.ts",
    "<rootDir>/src/app/components/solaris/solaris-cdom-list/solaris-cdom-list.component.spec.ts",
    "<rootDir>/src/app/components/solaris/solaris-image-repository/solaris-image-repository.component.spec.ts",
    "<rootDir>/src/app/components/solaris/solaris-ldom-create/solaris-ldom-create.component.spec.ts",
    "<rootDir>/src/app/components/solaris/solaris-services/solaris-service.service.spec.ts",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!@ngrx|ngx-cookie-service|ng-dynamic)"
  ],
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest'
  },
  collectCoverage: true,
  reporters: [ "default", "jest-junit" ]
};
