module.exports = {
  options: {
    doNotFollow: {
      path: 'node_modules',
      dependencyTypes: ['npm']
    },
    tsConfig: {
      fileName: 'tsconfig.json'
    },
    tsPreCompilationDeps: true,
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+'
      }
    }
  },

  forbidden: [
    {
      name: 'no-orphans',
      comment:
        'There should be no modules that are exported but not utilized (orphans)',
      severity: 'warn',
      from: {
        orphan: true,
        pathNot: [
          'node_modules',
          '\\.spec\\.ts$',
          '\\.test\\.ts$',
          'src/app/utils',
          'src/@types'
        ]
      },
      to: {
        pathNot: '^node_modules'
      }
    },
    {
      name: 'no-deprecated-core',
      comment: 'Avoid using deprecated core Node.js modules',
      severity: 'warn',
      from: {},
      to: {
        dependencyTypes: ['core'],
        path: '^(punycode|domain|constants|sys|_linklist|_stream_wrap)'
      }
    },
    {
      name: 'no-circular-dependencies',
      comment:
        'Avoid circular dependencies to prevent tight coupling between modules.',
      severity: 'warn',
      from: {},
      to: {
        circular: true
      }
    },
    {
      name: 'domain-no-deps',
      comment:
        'The domain layer should not depend on any other layers (application, infrastructure, lambda, middleware).',
      severity: 'error',
      from: {
        path: '^src/domain'
      },
      to: {
        path: '^(src/app|src/infra|src/middleware)'
      }
    },
    {
      name: 'app-no-deps',
      comment:
        'The application layer should only depend on the domain layer, no dependencies from infrastructure, lambda, or middleware are allowed.',
      severity: 'error',
      from: {
        path: '^src/app'
      },
      to: {
        path: '^(src/infra|src/middleware)',
        dependencyTypesNot: ['type-only']
      }
    },
    {
      name: 'infra-deps',
      comment:
        'The infrastructure layer should only depend on the domain, configuration, and external libraries (node_modules), including Node.js core modules.',
      severity: 'error',
      from: {
        path: '^src/infra'
      },
      to: {
        pathNot: '^(src/infra|src/domain|src/config|node_modules)',
        dependencyTypesNot: ['core']
      }
    },
    {
      name: 'middleware-deps',
      comment:
        'The middleware layer can only depend on the domain, infrastructure, configuration, and external libraries (node_modules).',
      severity: 'error',
      from: {
        path: '^src/middleware'
      },
      to: {
        pathNot: '^(src/domain|src/infra|src/config|node_modules)'
      }
    },
    {
      name: 'config-no-deps',
      comment: 'The configuration layer should not depend on any other layers.',
      severity: 'error',
      from: {
        path: '^src/config'
      },
      to: {
        pathNot: '^(src/config|node_modules)'
      }
    }
  ]
}
