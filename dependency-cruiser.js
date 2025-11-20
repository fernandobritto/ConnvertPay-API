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
      },
      text: {
        highlightFocused: true
      }
    },
    exclude: {
      path: [
        'node_modules',
        '\\.spec\\.ts$',
        '\\.test\\.ts$',
        'dist',
        'coverage'
      ]
    }
  },

  forbidden: [
    // === ARQUITETURA HEXAGONAL RULES ===
    {
      name: 'domain-isolation',
      comment:
        'Domain layer must remain isolated - no dependencies on adapters or external concerns',
      severity: 'error',
      from: {
        path: '^src/domain'
      },
      to: {
        path: '^src/(adapters|common/(?!errors|types))',
        pathNot: '^src/(ports|domain)'
      }
    },

    {
      name: 'domain-entities-pure',
      comment: 'Domain entities should only depend on other domain concepts',
      severity: 'error',
      from: {
        path: '^src/domain/entities'
      },
      to: {
        pathNot: '^(src/domain|src/ports|src/common/(errors|types))'
      }
    },

    {
      name: 'ports-interface-only',
      comment:
        'Ports should only contain interfaces and DTOs, no implementations',
      severity: 'error',
      from: {
        path: '^src/ports'
      },
      to: {
        pathNot: '^(src/ports|src/common/(errors|types)|src/domain/entities)'
      }
    },

    {
      name: 'inbound-adapters-dependencies',
      comment:
        'Inbound adapters can only depend on ports, domain services, and common utilities',
      severity: 'error',
      from: {
        path: '^src/adapters/inbound'
      },
      to: {
        pathNot: '^(src/ports|src/domain|src/common|src/adapters/inbound)'
      }
    },

    {
      name: 'outbound-adapters-dependencies',
      comment:
        'Outbound adapters can only depend on their own ports and common utilities',
      severity: 'error',
      from: {
        path: '^src/adapters/outbound'
      },
      to: {
        pathNot:
          '^(src/ports/outbound|src/domain/entities|src/common|src/adapters/outbound)'
      }
    },

    {
      name: 'controllers-layer-separation',
      comment:
        'Controllers should not directly access repositories or external providers',
      severity: 'error',
      from: {
        path: '^src/adapters/inbound/controllers'
      },
      to: {
        path: '^src/adapters/outbound/(repositories|providers)'
      }
    },

    {
      name: 'repositories-implementation-isolation',
      comment:
        'Repository implementations should not depend on other repositories directly',
      severity: 'warn',
      from: {
        path: '^src/adapters/outbound/repositories/[^/]+/[^/]+\\.repository\\.ts$'
      },
      to: {
        path: '^src/adapters/outbound/repositories/(?![^/]+/[^/]+\\.(interface|module)\\.ts$)'
      }
    },

    {
      name: 'providers-encapsulation',
      comment:
        'Provider implementations should not cross-reference each other directly',
      severity: 'warn',
      from: {
        path: '^src/adapters/outbound/providers/[^/]+/[^/]+\\.provider\\.ts$'
      },
      to: {
        path: '^src/adapters/outbound/providers/(?![^/]+/[^/]+\\.(interface|module)\\.ts$)'
      }
    },

    // === DEPENDENCY FLOW VALIDATION ===
    {
      name: 'no-reverse-dependencies',
      comment:
        'Prevent reverse dependencies - outer layers depending on inner layers inappropriately',
      severity: 'error',
      from: {
        path: '^src/adapters/outbound'
      },
      to: {
        path: '^src/adapters/inbound'
      }
    },

    {
      name: 'database-layer-isolation',
      comment:
        'Database layer should not be accessed directly by controllers or services',
      severity: 'error',
      from: {
        path: '^src/(adapters/inbound|domain)'
      },
      to: {
        path: '^src/adapters/outbound/database'
      }
    },

    // === GENERAL CLEAN ARCHITECTURE RULES ===
    {
      name: 'no-circular-dependencies',
      comment:
        'Circular dependencies create tight coupling and should be avoided',
      severity: 'error',
      from: {},
      to: {
        circular: true
      }
    },

    {
      name: 'no-orphaned-modules',
      comment: 'Avoid modules that are not used anywhere (orphans)',
      severity: 'warn',
      from: {
        orphan: true,
        pathNot: [
          'node_modules',
          '\\.spec\\.ts$',
          '\\.test\\.ts$',
          'src/main\\.ts$',
          'src/app\\.module\\.ts$',
          'src/adapters/outbound/database/migrations',
          'src/adapters/outbound/database/seeding',
          'src/common/types/\\.keep$',
          'src/adapters/inbound/interceptors/\\.keep$'
        ]
      },
      to: {}
    },

    {
      name: 'no-deprecated-core',
      comment: 'Avoid deprecated Node.js core modules',
      severity: 'warn',
      from: {},
      to: {
        dependencyTypes: ['core'],
        path: '^(punycode|domain|constants|sys|_linklist|_stream_wrap)'
      }
    },

    // === MODULE ORGANIZATION RULES ===
    {
      name: 'module-cohesion',
      comment:
        'Modules should maintain cohesion - related functionality should be grouped',
      severity: 'info',
      from: {
        path: '^src/domain/[^/]+/'
      },
      to: {
        path: '^src/domain/(?![^/]+/)',
        pathNot: '^src/(ports|common)'
      }
    },

    {
      name: 'common-utilities-usage',
      comment: 'Common utilities should be used appropriately across layers',
      severity: 'info',
      from: {},
      to: {
        path: '^src/common',
        pathNot: '^src/common/(errors|helpers|types)'
      }
    }
  ],

  // === ALLOWED PATTERNS ===
  allowed: [
    {
      name: 'domain-to-ports',
      comment: 'Domain services can depend on port interfaces',
      from: {
        path: '^src/domain'
      },
      to: {
        path: '^src/ports'
      }
    },

    {
      name: 'adapters-to-ports',
      comment: 'Adapters implement port interfaces',
      from: {
        path: '^src/adapters'
      },
      to: {
        path: '^src/ports'
      }
    },

    {
      name: 'common-dependencies',
      comment: 'All layers can use common utilities, errors, and types',
      from: {},
      to: {
        path: '^src/common/(errors|helpers|types)'
      }
    }
  ]
}
