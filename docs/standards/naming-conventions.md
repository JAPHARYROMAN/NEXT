# Naming Conventions

> One naming grammar across the whole monorepo. Consistent names are not
> cosmetic — they make ownership obvious, prevent two things meaning the same
> thing under different names, and let CI validate structure.

Status: **binding**.

## 1. Services

- Directory + deployment name: **kebab-case**, suffixed `-service` —
  `auth-service`, `media-service`, `recommendation-service`.
- Compute coordinators may pair with a `worker/` or named perf-worker subdir
  ([ADR 0037](../adr/0037-compute-coordinator-worker-split.md)).
- The directory name, the Go module's final segment, the Helm release, and the
  Kubernetes deployment all **match**.

## 2. Packages

- TypeScript packages: scoped `@next/<name>`, `<name>` kebab-case —
  `@next/feed-types`, `@next/design-system`.
- Go shared modules: `packages/go/<name>`.
- Rust crates: `packages/rust/<name>`. Python: `packages/python/<name>` and
  `ai/<subsystem>` with a `src/next_<subsystem>/` package.
- A package name states _what it is_; no two packages share a semantic purpose
  ([monorepo-governance.md](monorepo-governance.md)).

## 3. Events & Kafka topics

- **Category stream** (topic): `<category>.events.v<N>` —
  `media.events.v1`, `commerce.events.v1`. DLQ: `<category>.events.dlq.v<N>`.
- **Event type** (envelope field): `<category>.<entity>.<event>.v<n>` —
  `media.video.published.v1`, `commerce.payout.completed.v1`.
- `<event>` is a **past-tense fact** — `created`, `published`, `failed`,
  `completed` — never an imperative.
- See [event-standards.md](event-standards.md). New per-event _topics_ are
  prohibited.

## 4. Protobuf

- Package: `next.<domain>.v<N>` — `next.media.v1`, `next.recommendation.v1`.
- `go_package`: `github.com/next-ecosystem/next/gen/go/<domain>/v<N>;<domain>v<N>`.
- Service: `<Domain>Service`; RPC: `VerbNoun`; messages: `<Rpc>Request` /
  `<Rpc>Response` ([api-standards.md](api-standards.md)).
- Enum zero value: `<ENUM>_UNSPECIFIED`.

## 5. GraphQL

- Types: `PascalCase`. Fields: `camelCase`. Enums: `SCREAMING_SNAKE`.
- Mutations: `verbNoun`, taking a single `input` argument.
- A subgraph's types are namespaced to its domain; no two subgraphs define the
  same type.

## 6. Environment variables

- **SCREAMING_SNAKE_CASE** — `POSTGRES_URL`, `HTTP_ADDR`, `GRPC_ADDR`,
  `OTEL_EXPORTER_OTLP_ENDPOINT`, `NEXT_ENV`.
- NEXT-specific variables are prefixed `NEXT_` where ambiguity is possible.
- Variable names are consistent across services — the same concept has the same
  variable name everywhere.

## 7. Telemetry metrics

- Follow OpenTelemetry semantic conventions; dotted, lower-case namespaces —
  `<domain>.<subsystem>.<measurement>` (e.g. `media.transcode.duration`).
- Units are explicit and conventional (seconds, bytes, ...).
- The same measurement has the same metric name across services.

## 8. Feature flags

- Flag keys: kebab-case, domain-prefixed — `recommendation-new-ranker`,
  `media-ll-hls`.
- A flag is named for _what it gates_, has an owner, and a removal plan
  ([docs/governance/release-governance.md](../governance/release-governance.md) §5).

## 9. Databases

- Postgres: one database per service, named for the service domain;
  `snake_case` tables and columns.
- Migrations: `NNN_<slug>.up.sql` / `NNN_<slug>.down.sql`
  ([database-standards.md](database-standards.md)).
- Redis keys: `next:<service>:<entity>:<id>`.

## 10. Git

- Branches: `agent/<agent>-<domain>` (`agent/claude-architecture`), or
  `<type>/<slug>` for scoped work. `main`, `develop` are protected.
- Commits: Conventional Commits — `type(scope): subject` — subject lowercase,
  imperative; scope from the repo's commitlint scope set.

## 11. Documentation

- Docs: kebab-case `.md` files; directory `README.md` indexes the directory.
- ADRs: `NNNN-short-slug.md`, four-digit sequential
  ([docs/adr/README.md](../adr/README.md)).

## 12. The anti-collision rule

If two things would have names that imply the same meaning, that is a signal one
of them is a **duplicate** — resolve the duplication, do not rename around it.
Consistent naming is how NEXT _detects_ "two systems doing the same thing"
before it becomes drift.

## Related

- [event-standards.md](event-standards.md) · [api-standards.md](api-standards.md) · [monorepo-governance.md](monorepo-governance.md) · [enforcement-mechanisms.md](enforcement-mechanisms.md)
