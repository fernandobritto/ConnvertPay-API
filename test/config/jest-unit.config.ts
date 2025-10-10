import type { JestConfigWithTsJest } from 'ts-jest'

const jestConfig: JestConfigWithTsJest = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1'
  },
  testTimeout: 60000,
  rootDir: '../../',
  testEnvironment: 'node',
  collectCoverageFrom: ['**/*.(t|j)s'],
  collectCoverage: true,
  coverageReporters: ['lcov', 'text'],
  coverageProvider: 'v8',
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/test/',
    'jest.config.ts',
    '/src/infra/database/',
    '/src/middlewares/',
    '.eslintrc',
    '/coverage/',
    '\\.entity\\.ts$',
    '\\.dto\\.ts$',
    '\\.controller\\.ts$',
    '/src\\/app\\/\\S*\\.module\\.ts$',
    '/src/infra/config/',
    '/src/domain/infra/config/',
    '/src/domain/errors',
    '/src/app.module.ts',
    '/src/app.controller.ts',
    '/src/main.ts'
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
}

export default jestConfig
