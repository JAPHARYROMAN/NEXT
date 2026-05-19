# Shared packages

| Package                                  | Purpose                                                     | Languages |
| ---------------------------------------- | ----------------------------------------------------------- | --------- |
| [`@next/config`](config)                 | Shared eslint, tsconfig, tailwind, vitest, prettier configs | TS        |
| [`@next/types`](types)                   | Branded IDs, pagination, Result, media types                | TS        |
| [`@next/design-system`](design-system)   | Tokens, themes, motion easings                              | TS, CSS   |
| [`@next/ui`](ui)                         | Cross-surface UI primitives (web + native)                  | TS        |
| [`@next/logger`](logger)                 | Structured logging (pino) with OTel correlation             | TS        |
| [`@next/telemetry`](telemetry)           | OpenTelemetry SDK wrapper                                   | TS        |
| [`@next/events`](events)                 | Kafka producer + consumer + topic catalog                   | TS        |
| [`@next/auth-sdk`](auth-sdk)             | OAuth2/OIDC + JWT verification (JWKS-cached)                | TS        |
| [`@next/database`](database)             | Postgres/Redis/ClickHouse client wrappers                   | TS        |
| [`@next/api-client`](api-client)         | Generated GraphQL + gRPC clients                            | TS        |
| [`@next/feature-flags`](feature-flags)   | OpenFeature + typed flag registry                           | TS        |
| [`@next/identity-types`](identity-types) | Sessions, tiers, devices, trust types                       | TS        |
| [`@next/session-utils`](session-utils)   | JWT verifier + bearer token helpers                         | TS        |
| [`@next/security-utils`](security-utils) | Constant-time eq, random tokens, PKCE                       | TS        |
| [`@next/permissions`](permissions)       | Canonical scope catalog + default tier scopes               | TS        |
| [`@next/access-control`](access-control) | Local-first authorize + PDP client                          | TS        |
| [`@next/trust-events`](trust-events)     | TS types mirroring `trust.*` Kafka events                   | TS        |
| [`packages/go/*`](go)                    | Go shared modules: telemetry, eventbus, auth, database      | Go        |
| [`packages/rust/*`](rust)                | Rust crates: telemetry, eventbus, proto                     | Rust      |
| [`packages/python/*`](python)            | Python packages: telemetry, …                               | Python    |

## Versioning

TS packages are versioned via [Changesets](../.changeset). Go modules use semver tags
(`packages/go/<pkg>/v0.1.0`). Rust crates use workspace-wide versioning. Python
packages are workspace members of the root `uv` workspace.

## Boundaries

Shared packages must:

- Have no runtime dependency on any `apps/*` or `services/*`.
- Avoid framework-specific imports unless scoped to a subpath (`./web`, `./native`).
- Stay tree-shakeable (named exports, no top-level side effects).

If you find yourself wanting to add app-specific behavior to a shared package,
add it to the consuming app instead.
