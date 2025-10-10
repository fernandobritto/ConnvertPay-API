export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  transformIgnorePatterns: ['node_modules/(?!@nestjs/axios)'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^test/(.*)$': '<rootDir>/test/$1'
  },
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.+(ts|tsx|js)',
    '**/?(*.)+(integration-spec|spec|e2e-spec).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(t|j)s?$': ['@swc/jest']
  },
  testTimeout: 60000
}
