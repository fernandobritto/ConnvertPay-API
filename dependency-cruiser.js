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
    },
    // Dependencies not in any allowed rule are flagged at info level.
    // This surfaces undocumented flows without blocking CI.
    allowedSeverity: 'info'
  },

  forbidden: [
    // =========================================================
    // DOMAIN LAYER
    // =========================================================

    {
      // Domain service files must never import adapter implementations.
      // They communicate with the outside world exclusively through port
      // interfaces injected via DI tokens (e.g. ACCOUNT_REPOSITORY,
      // METRICS_PROVIDER).
      name: 'domain-service-isolation',
      comment:
        'Domain services must stay pure — they may only depend on port interfaces, other domain services/entities, and common utilities. No adapter implementations allowed.',
      severity: 'error',
      from: {
        path: '^src/domain/.+\\.service\\.ts$'
      },
      to: {
        path: '^src/adapters'
      }
    },

    {
      // Domain module files (*.module.ts) act as NestJS DI wiring units.
      // They are allowed to import adapter modules (e.g. AccountRepositoryModule,
      // MetricsProviderModule) because that is how NestJS wires the dependency
      // graph. However, they must NOT bypass the module boundary by directly
      // importing concrete implementation files (*.provider.ts, *.repository.ts).
      name: 'domain-module-no-concrete-implementations',
      comment:
        'Domain module files must not directly import outbound adapter implementation files. Import the adapter\'s NestJS module instead.',
      severity: 'error',
      from: {
        path: '^src/domain/.+\\.module\\.ts$'
      },
      to: {
        path: '^src/adapters/outbound/.+\\.(provider|repository)\\.ts$'
      }
    },

    {
      // Domain entities are plain TypeORM-decorated classes. They should have
      // zero knowledge of any application layer — they only carry data and ORM
      // metadata. TypeORM itself is an external npm package excluded from the
      // graph, so only internal src/ paths need to be forbidden here.
      name: 'domain-entities-pure',
      comment:
        'Domain entities must not import from adapters, ports, or domain services. They may only use TypeORM (external) and other entity files.',
      severity: 'error',
      from: {
        path: '^src/domain/entities'
      },
      to: {
        // Matches adapters, ports, or any domain path that is NOT domain/entities
        path: '^src/(adapters|ports|domain/(?!entities))'
      }
    },

    {
      // Common utilities (errors, helpers, types) are leaf-level modules.
      // They must not import from any application layer to remain universally
      // reusable without creating cycles.
      name: 'common-layer-isolation',
      comment:
        'Common utilities must not import from adapters, ports, or the domain layer. They are leaf-level and must remain dependency-free within src/.',
      severity: 'error',
      from: {
        path: '^src/common'
      },
      to: {
        path: '^src/(adapters|ports|domain)'
      }
    },

    // =========================================================
    // PORTS LAYER
    // =========================================================

    {
      // Port files (interfaces and DTOs) define contracts only.
      // They must not reference any concrete adapter implementation —
      // doing so would couple the contract to an implementation detail.
      name: 'ports-no-adapter-imports',
      comment:
        'Port interfaces and DTOs must not reference adapter implementations. Ports define contracts; adapters fulfil them.',
      severity: 'error',
      from: {
        path: '^src/ports'
      },
      to: {
        path: '^src/adapters'
      }
    },

    {
      // Outbound port interfaces may reference domain entities (e.g.
      // IAccountRepository uses AccountEntity as a parameter/return type).
      // They must not, however, import domain service logic — that would
      // invert the dependency direction.
      name: 'ports-no-domain-service-imports',
      comment:
        'Port definitions must not import domain service logic. They may reference domain entities for typing.',
      severity: 'error',
      from: {
        path: '^src/ports'
      },
      to: {
        path: '^src/domain/.+\\.service\\.ts$'
      }
    },

    // =========================================================
    // INBOUND ADAPTER LAYER
    // =========================================================

    {
      // Inbound adapters (controllers, interceptors, middlewares) are the
      // outermost layer receiving external requests. They must only depend on:
      //   - Port interfaces/DTOs  (src/ports/)
      //   - Domain services       (src/domain/)
      //   - Common utilities      (src/common/)
      //   - Other inbound helpers (src/adapters/inbound/)
      // Importing any outbound adapter directly bypasses the port abstraction
      // and tightly couples HTTP-handling code to infrastructure details.
      // KNOWN VIOLATION: exception-filter.middleware.ts imports DateProvider
      // (concrete) — it should inject IDateProvider via DATE_PROVIDER token.
      name: 'inbound-adapters-no-outbound-imports',
      comment:
        'Inbound adapters must not import outbound adapter implementations. Use port interfaces (e.g. IDateProvider via DATE_PROVIDER token) instead of concrete classes.',
      severity: 'error',
      from: {
        path: '^src/adapters/inbound'
      },
      to: {
        path: '^src/adapters/outbound'
      }
    },

    {
      // Controllers specifically must not bypass domain services and reach
      // into repository or provider ports directly. All data access must flow
      // through a domain service.
      // Exception: metrics.controller.ts is intentionally a thin passthrough
      // that exposes raw Prometheus metrics; it may inject IMetricsProvider
      // directly via its DI token.
      name: 'controllers-no-direct-repository-access',
      comment:
        'Controllers must not access repository port interfaces directly. Route all data operations through a domain service.',
      severity: 'error',
      from: {
        path: '^src/adapters/inbound/controllers'
      },
      to: {
        path: '^src/ports/outbound/repositories'
      }
    },

    // =========================================================
    // OUTBOUND ADAPTER LAYER
    // =========================================================

    {
      // The fundamental direction rule: outbound (infrastructure) adapters
      // cannot depend on inbound (HTTP/UI) adapters. Information flows inward
      // from request handling to business logic to persistence — never outward
      // from persistence back to HTTP concerns.
      name: 'outbound-no-inbound-imports',
      comment:
        'Outbound adapters must not depend on inbound adapters. This would reverse the hexagonal dependency flow.',
      severity: 'error',
      from: {
        path: '^src/adapters/outbound'
      },
      to: {
        path: '^src/adapters/inbound'
      }
    },

    {
      // Outbound adapter implementations (repositories, providers) should not
      // pull in domain services. They implement port interfaces defined against
      // domain entities, and that is all they need from the domain layer.
      name: 'outbound-no-domain-service-imports',
      comment:
        'Outbound adapter implementations must not import domain services. They implement outbound ports against domain entities only.',
      severity: 'error',
      from: {
        path: '^src/adapters/outbound'
      },
      to: {
        path: '^src/domain/.+\\.service\\.ts$'
      }
    },

    {
      // Outbound adapters serve the domain layer — they have no reason to
      // consume inbound port DTOs (request/response shapes). Consuming those
      // would mix persistence concerns with HTTP concerns.
      name: 'outbound-no-inbound-port-imports',
      comment:
        'Outbound adapters must not import inbound port DTOs. Inbound DTOs are HTTP request/response contracts; outbound adapters deal with persistence/provider concerns.',
      severity: 'error',
      from: {
        path: '^src/adapters/outbound'
      },
      to: {
        path: '^src/ports/inbound'
      }
    },

    {
      // Repository implementations are scoped to a single aggregate. Cross-
      // repository calls create hidden aggregate coupling; use domain services
      // to coordinate multi-aggregate operations instead.
      name: 'repositories-no-cross-repository-imports',
      comment:
        'Repository implementations must not import other repository implementations. Coordinate multi-aggregate operations through domain services.',
      severity: 'warn',
      from: {
        path: '^src/adapters/outbound/repositories/[^/]+/[^/]+\\.repository\\.ts$'
      },
      to: {
        path: '^src/adapters/outbound/repositories/[^/]+/[^/]+\\.repository\\.ts$'
      }
    },

    {
      // Provider implementations are single-responsibility infrastructure
      // adapters. Cross-provider coupling should be expressed through port
      // interfaces and domain services, not direct import chains.
      name: 'providers-no-cross-provider-imports',
      comment:
        'Provider implementations must not directly import other provider implementations. Use port interfaces if cross-provider access is necessary.',
      severity: 'warn',
      from: {
        path: '^src/adapters/outbound/providers/[^/]+/[^/]+\\.provider\\.ts$'
      },
      to: {
        path: '^src/adapters/outbound/providers/[^/]+/[^/]+\\.provider\\.ts$'
      }
    },

    // =========================================================
    // DATABASE LAYER ISOLATION
    // =========================================================

    {
      // The database bootstrap files (DataSource config, TypeOrmModuleFactory,
      // migrations) are infrastructure configuration. They must only be
      // consumed by AppModule (root wiring) and outbound adapter modules.
      // Domain layer files and inbound adapter files must not reach into DB
      // config directly — doing so would couple business logic to the ORM
      // bootstrap sequence.
      // NOTE: Domain *.module.ts files are excluded here because they
      // legitimately import outbound adapter modules (TypeORM feature modules),
      // which is normal NestJS wiring.
      name: 'database-layer-isolation',
      comment:
        'Database bootstrap files (DataSource, TypeOrmModuleFactory, migrations) must not be imported by controllers, services, or domain layer files.',
      severity: 'error',
      from: {
        path: '^src/(adapters/inbound|domain)',
        pathNot: '^src/domain/.+\\.module\\.ts$'
      },
      to: {
        path: '^src/adapters/outbound/database'
      }
    },

    // =========================================================
    // GENERAL RULES
    // =========================================================

    {
      name: 'no-circular-dependencies',
      comment:
        'Circular dependencies create tight coupling, complicate testing, and can cause runtime initialisation failures. They must be eliminated.',
      severity: 'error',
      from: {},
      to: {
        circular: true
      }
    },

    {
      name: 'no-orphaned-modules',
      comment:
        'Files not imported anywhere are either dead code or indicate incomplete module wiring.',
      severity: 'warn',
      from: {
        orphan: true,
        pathNot: [
          'node_modules',
          '\\.spec\\.ts$',
          '\\.test\\.ts$',
          '\\.keep$',
          // Application entry points — never imported
          'src/main\\.ts$',
          'src/app\\.module\\.ts$',
          // TypeORM CLI artefacts — invoked by tooling, not imported
          'src/adapters/outbound/database/typeorm-data-source\\.ts$',
          'src/adapters/outbound/database/migrations/',
          'src/adapters/outbound/database/seeding/',
          // Providers fully implemented but not yet registered in AppModule.
          // Remove these exclusions once the providers are wired up.
          'src/adapters/outbound/providers/(encrypter|jwt)/',
          'src/ports/outbound/providers/(encrypter|jwt)/',
          // Empty type placeholder directory
          'src/common/types/'
        ]
      },
      to: {}
    },

    {
      name: 'no-deprecated-core',
      comment: 'Avoid deprecated Node.js built-in modules.',
      severity: 'warn',
      from: {},
      to: {
        dependencyTypes: ['core'],
        path: '^(punycode|domain|constants|sys|_linklist|_stream_wrap)'
      }
    }
  ],

  // =========================================================
  // ALLOWED DEPENDENCY PATTERNS
  // These rules document the intended dependency flows of the
  // hexagonal architecture. Any internal src/ dependency not
  // covered by at least one rule here will be surfaced at
  // `allowedSeverity` (info) as an undocumented flow.
  // =========================================================
  allowed: [
    {
      // Domain services inject outbound port interfaces (IAccountRepository,
      // IMetricsProvider, …) via DI tokens. They never touch implementations.
      name: 'domain-services-to-outbound-ports',
      comment: 'Domain services depend only on outbound port interfaces via DI tokens.',
      from: {
        path: '^src/domain/.+\\.service\\.ts$'
      },
      to: {
        path: '^src/ports/outbound'
      }
    },

    {
      // Domain services receive inbound DTOs as validated input parameters
      // (e.g. AccountDto passed from AccountController → AccountService).
      name: 'domain-services-to-inbound-dtos',
      comment: 'Domain services accept inbound DTOs as validated input parameters.',
      from: {
        path: '^src/domain/.+\\.service\\.ts$'
      },
      to: {
        path: '^src/ports/inbound'
      }
    },

    {
      // Domain services may call other domain services
      // (e.g. AccountService → MetricsService).
      name: 'domain-services-to-domain-services',
      comment: 'Domain services may depend on other domain services.',
      from: {
        path: '^src/domain/.+\\.service\\.ts$'
      },
      to: {
        path: '^src/domain/.+\\.service\\.ts$'
      }
    },

    {
      // NestJS module files are the DI wiring layer. Domain module files
      // legitimately import inbound controllers and outbound adapter modules
      // to assemble the NestJS module graph.
      name: 'domain-modules-wiring',
      comment: 'Domain NestJS module files wire controllers and adapter modules for DI composition.',
      from: {
        path: '^src/domain/.+\\.module\\.ts$'
      },
      to: {
        path: '^src/(adapters|ports|domain)'
      }
    },

    {
      // Inbound adapters (controllers, interceptors, middlewares) invoke domain
      // services to execute business operations.
      name: 'inbound-adapters-to-domain',
      comment: 'Inbound adapters invoke domain services for business operations.',
      from: {
        path: '^src/adapters/inbound'
      },
      to: {
        path: '^src/domain'
      }
    },

    {
      // Inbound adapters depend on inbound port DTOs for request/response
      // shaping and on outbound port interfaces for direct provider injection
      // (e.g. metrics.controller.ts injects METRICS_PROVIDER directly).
      name: 'inbound-adapters-to-ports',
      comment: 'Inbound adapters depend on port DTOs (inbound) and port interfaces (outbound) for DI.',
      from: {
        path: '^src/adapters/inbound'
      },
      to: {
        path: '^src/ports'
      }
    },

    {
      // Inbound adapter helpers (e.g. middlewares/helpers.ts) may be shared
      // within the inbound adapter layer.
      name: 'inbound-adapters-internal',
      comment: 'Inbound adapter files may depend on other inbound adapter files (e.g. shared helpers).',
      from: {
        path: '^src/adapters/inbound'
      },
      to: {
        path: '^src/adapters/inbound'
      }
    },

    {
      // Outbound adapter implementations (repositories, providers) implement
      // the outbound port interfaces they correspond to.
      name: 'outbound-adapters-to-outbound-ports',
      comment: 'Outbound adapter implementations depend on outbound port interfaces they implement.',
      from: {
        path: '^src/adapters/outbound'
      },
      to: {
        path: '^src/ports/outbound'
      }
    },

    {
      // Outbound repository adapters use domain entities as the persistence
      // model (TypeORM entity classes passed to the EntityManager/Repository).
      name: 'outbound-adapters-to-domain-entities',
      comment: 'Outbound repository adapters use domain entities as the persistence model.',
      from: {
        path: '^src/adapters/outbound'
      },
      to: {
        path: '^src/domain/entities'
      }
    },

    {
      // Outbound adapter modules may depend on other outbound adapter modules
      // within the same sub-layer (e.g. a repository module importing TypeORM
      // feature modules, or a provider module re-exporting another module).
      name: 'outbound-adapters-internal',
      comment: 'Outbound adapter module files may depend on other outbound adapter modules for NestJS wiring.',
      from: {
        path: '^src/adapters/outbound/.+\\.module\\.ts$'
      },
      to: {
        path: '^src/adapters/outbound'
      }
    },

    {
      // Outbound port interfaces may reference domain entities as parameter
      // and return types (e.g. IAccountRepository uses AccountEntity).
      name: 'outbound-ports-to-domain-entities',
      comment: 'Outbound port interfaces may reference domain entities for parameter and return type definitions.',
      from: {
        path: '^src/ports/outbound'
      },
      to: {
        path: '^src/domain/entities'
      }
    },

    {
      // Common utilities, error classes, and type helpers are available to
      // every layer without restriction.
      name: 'common-utilities-available-everywhere',
      comment: 'Common utilities, errors, and types are available to all layers.',
      from: {},
      to: {
        path: '^src/common/(errors|helpers|types)'
      }
    }
  ]
}

