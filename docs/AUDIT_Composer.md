# NEXT Repository Audit — Composer

- **Auditor**: Composer (Cursor Agent)
- **Date**: 2026-05-20
- **Repository**: `c:\projects\Actual Projects\next`
- **Mode**: Read-only inspection (no product/application code modified)
- **Methodology**: Root/tooling inspection, `/services/*` structure scan, `/apps`, `/packages`, `/ai`, `/infrastructure`, `.github/workflows`, `docker-compose.yml`, `buf.yaml`, grep for stubs/TODOs, cross-reference with existing Phase 10 audits in `docs/audits/`

---

## 1. Executive summary

NEXT is a **large, well-governed polyglot monorepo** with clear runtime boundaries (Go backend, TypeScript frontend, Python AI, Rust perf workers), substantial infrastructure-as-code, and a mature ADR/governance layer. **~49% of backend services (19/39) are runnable** with gRPC entrypoints, Postgres migrations, and OTel instrumentation; **~51% are proto/README scaffolds**. The experience layer is **broad and demo-driven**: 14 apps and 77+ TS packages ship rich UI, but most web surfaces consume `apps/web/src/lib/demo-*.ts` rather than live GraphQL/gRPC backends.

**No P0 blockers** were found for continued integration work. **Five P1 themes** dominate risk: (1) frontend–backend contract gap (demo data vs. api-gateway), (2) near-zero Go test coverage outside feed/recommendation/event-gateway, (3) duplicate transcoding implementations (Rust in `media-service` vs. Go `transcoding-service`), (4) dual event-topology / layout drift (partially addressed by ADR 0038/0039 but not fully migrated), (5) 20 unbuilt service scaffolds creating proto/integration debt.

**MVP readiness verdict**: **Not ready for production MVP** — suitable for **integration/demo MVP** (local docker-compose + subset of identity/discovery/media services + UI prototypes). Production MVP requires P1 integration pass, test bar, and wiring apps off demo libs.

**Confidence**: **Medium** — structural evidence is strong; CI build/test pass/fail was **not executed** in this audit run (section 22 UNKNOWN).

---

## 2. Full checklist (28 sections)

| # | Section | Status | Priority |
|---|---------|--------|----------|
| 1 | Monorepo structure | **PASS** | — |
| 2 | Backend service structure | **PARTIAL** | P1 |
| 3 | Go-only backend compliance | **PASS** | — |
| 4 | Protobuf definitions | **PASS** | P2 |
| 5 | gRPC APIs | **PARTIAL** | P1 |
| 6 | Database migrations | **PARTIAL** | P2 |
| 7 | Postgres usage | **PARTIAL** | P2 |
| 8 | Redis usage | **PARTIAL** | P2 |
| 9 | Kafka/event usage | **PARTIAL** | P1 |
| 10 | ClickHouse/analytics usage | **PARTIAL** | P2 |
| 11 | Authentication and authorization | **PARTIAL** | P1 |
| 12 | User/project/video generation domain model | **PARTIAL** | P1 |
| 13 | Queue/job lifecycle | **PARTIAL** | P1 |
| 14 | Frontend apps | **PASS** | P2 |
| 15 | Frontend/backend contract alignment | **FAIL** | P0* |
| 16 | Shared packages | **PASS** | P2 |
| 17 | Environment/config handling | **PASS** | P3 |
| 18 | Docker/dev environment | **PASS** | — |
| 19 | CI/CD | **PASS** | P2 |
| 20 | Observability/logging/tracing/metrics | **PARTIAL** | P2 |
| 21 | Testing coverage | **FAIL** | P1 |
| 22 | Build/lint/typecheck status | **UNKNOWN** | P2 |
| 23 | Security risks | **PARTIAL** | P2 |
| 24 | Performance risks | **PARTIAL** | P2 |
| 25 | Incomplete TODOs/stubs/placeholders | **PARTIAL** | P2 |
| 26 | Broken imports or dead code | **UNKNOWN** | P2 |
| 27 | Architecture drift from approved rules | **PARTIAL** | P1 |
| 28 | MVP readiness | **FAIL** | P1 |

\*Section 15 rated FAIL for *production contract alignment*; demo/UI MVP may still proceed in parallel per Phase 10 audit guidance.

---

## 3. Detailed findings by section

### 1. Monorepo structure — **PASS**

**Evidence**

- `c:\projects\Actual Projects\next\package.json` — root scripts via Turbo (build, lint, test, typecheck, codegen)
- `c:\projects\Actual Projects\next\pnpm-workspace.yaml` — workspaces: `apps/*`, `packages/*`, `services/*/clients/typescript`, `tooling/*`; version catalog
- `c:\projects\Actual Projects\next\turbo.json` — task graph with codegen, integration test env vars
- `c:\projects\Actual Projects\next\go.work` — 38 Go modules (services + `packages/go/*` + `gen/go`)
- `c:\projects\Actual Projects\next\Cargo.toml` — Rust workspace (transcoder, live ingest, ranker, vector indexer)
- `c:\projects\Actual Projects\next\pyproject.toml` — uv workspace for 22 AI packages
- `c:\projects\Actual Projects\next\Taskfile.yml` — polyglot bootstrap/build/test orchestration

**Findings**

Coherent polyglot monorepo with documented separation: JS/TS via pnpm+Turbo, Go via `go.work`, Rust via Cargo, Python via uv. Aligns with ADR 0001, 0034, runtime governance.

**Risks**

Low. Toolchain sprawl is intentional but requires `mise` discipline.

**Recommended fixes**

None structural. Ensure `go.work` stays synced when adding services.

**Priority**: —

---

### 2. Backend service structure — **PARTIAL**

**Evidence**

- 39 directories with `services/*/go.mod`
- 19 with `services/*/cmd/server/main.go` (functional)
- 20 without entrypoint (scaffold)
- Canonical standard: `docs/standards/go-service-standards.md`, `docs/adr/0038-canonical-go-service-layout.md`
- Prior matrix: `docs/audits/service-maturity-matrix.md`

**Functional services (19)** — have `cmd/server`, `internal/api`, most have `internal/store` + `migrations/`:

`auth-service`, `profile-service`, `session-service`, `api-gateway`, `access-control-service`, `trust-service`, `device-graph-service`, `creator-identity-service`, `account-recovery-service`, `notification-auth-service`, `identity-graph-service`, `upload-service`, `media-service`, `transcoding-service`, `media-processing-orchestrator`, `analytics-service`, `event-gateway`, `recommendation-service`, `feed-service`

**Scaffold services (20)** — `go.mod` + `README` [+ `proto`], no `cmd/server`:

Includes `community-service`, `live-service` (Go module only; Rust `ingest/` exists per `Cargo.toml`), `payment-service`, `search-service`, `moderation-service`, `notification-service`, and media/discovery scaffolds (`playback-service`, `ranking-service`, etc.)

**Layout drift**

- Phase 6–8 services: `internal/{api,domain,store}` (+ `eventbus`/`consumer` where used)
- `analytics-service`, `event-gateway`: `internal/{kafka,consumer,config,metrics,events,...}` — ADR 0038 maps these but migration incomplete
- `community-service`: no `proto/` (irregular scaffold)
- `live-service`: no Go `cmd/server`; only Rust `ingest/` member in workspace

**Risks**

New scaffolds may diverge further from ADR 0038 without `_template` enforcement.

**Recommended fixes**

1. Enforce `_template` for all new services.
2. Normalize `community-service` and `live-service` to scaffold standard.
3. Lazily migrate `analytics-service` / `event-gateway` to `eventbus`/`consumer` naming.

**Priority**: P1

---

### 3. Go-only backend compliance — **PASS**

**Evidence**

- Grep for Express/Nest/Fastify in `services/`: **no matches**
- Grep for `package.json` under `services/`: **no matches** (only `services/*/clients/typescript` in pnpm workspace)
- All 39 `services/*/go.mod` present
- `docs/governance/runtime-governance.md`, ADR 0007

**Findings**

No Node/TypeScript backend services. Rust workers exist only as permitted perf tier (`media-service/transcoder`, `recommendation-service/ranker`, `live-service/ingest`) per ADR 0037.

**Risks**

RB-2: Rust transcoder nested in `media-service/` overlaps `transcoding-service` (boundary/ownership, not language violation).

**Recommended fixes**

Relocate transcoder per ADR 0037/0038; document in service README.

**Priority**: P2 (ownership), not runtime violation

---

### 4. Protobuf definitions — **PASS**

**Evidence**

- 40 `*.proto` files under `services/**/proto` and `packages/events/schemas`
- `c:\projects\Actual Projects\next\buf.yaml` — 27 Buf modules + events schemas; STANDARD lint; breaking: FILE
- `c:\projects\Actual Projects\next\buf.gen.yaml` — Go codegen to `gen/go`
- Example: `services/auth-service/proto/auth/v1/auth.proto` — `buf.validate`, `SessionService` RPCs
- Scaffold example: `services/clip-generation-service/proto/clipgeneration/v1/clipgeneration.proto`

**Findings**

Schema-first posture is real: protos exist for scaffolds and functional services. Event schemas live in `packages/events/schemas/{auth,media,recommendation,payment,audit}/v1/`.

**Risks**

Proto drift on 20 unimplemented services; dual event definition mechanisms noted in Phase 10 (ADR 0039 addresses source-of-truth).

**Recommended fixes**

Run `buf breaking` on PRs; implement scaffolds in dependency order per `docs/integration/next-integration-roadmap.md`.

**Priority**: P2

---

### 5. gRPC APIs — **PARTIAL**

**Evidence**

- Generated stubs: `gen/go/**/*.pb.go`, `*_grpc.pb.go` (e.g. `gen/go/recommendation/v1/`)
- Functional handlers: `services/*/internal/api/*_service.go` (19 api packages)
- `api-gateway` imports `gen/go/auth/v1`, `gen/go/profile/v1` — `services/api-gateway/cmd/server/main.go`
- Scaffold protos without servers: e.g. `playback-service`, `discovery-service`

**Findings**

gRPC is implemented for the functional 19; GraphQL gateway only federates **auth + profile** today. Remaining domains exist as contracts only.

**Risks**

Clients assuming full GraphQL federation will fail for media, feed, live, payments.

**Recommended fixes**

Extend `api-gateway` subgraphs as services become functional; publish client codegen in `services/*/clients/typescript`.

**Priority**: P1

---

### 6. Database migrations — **PARTIAL**

**Evidence**

- 15 services with `migrations/001_init.up.sql`:
  `auth-service`, `profile-service`, `session-service`, `access-control-service`, `trust-service`, `device-graph-service`, `creator-identity-service`, `account-recovery-service`, `notification-auth-service`, `upload-service`, `media-service`, `transcoding-service`, `media-processing-orchestrator`, `feed-service`, `recommendation-service`
- 15 matching `001_init.down.sql` files
- Naming matches `NNN_*.up.sql` / `NNN_*.down.sql` convention
- ClickHouse infra migration: `infrastructure/clickhouse/migrations/001_event_analytics.sql`

**Findings**

Migrations exist for DB-owning functional services; pattern is consistent `001_init`. No evidence of golang-migrate runner wired in CI (not inspected).

**Risks**

Services without migrations may still claim DB ownership in README (e.g. analytics uses ClickHouse, not Postgres migrations in service dir).

**Recommended fixes**

Add migration CI check; document non-Postgres stores per service README.

**Priority**: P2

---

### 7. Postgres usage — **PARTIAL**

**Evidence**

- `packages/go/database/database.go` — pgx pool + Redis constructors
- `docker-compose.yml` — Postgres 16 on host port 5433
- `config/.env.example` — `POSTGRES_URL=postgres://next:next@localhost:5433/next`
- Per-service `internal/store/postgres.go` in functional identity/media services
- ADR 0017 database-per-service

**Findings**

Postgres is the primary transactional store for functional services. Scaffold services declare Postgres in README but have no store implementation.

**Risks**

Cross-service SQL not audited line-by-line; ADR 0017 assumed enforced by review.

**Recommended fixes**

Add integration tests with testcontainers per service store.

**Priority**: P2

---

### 8. Redis usage — **PARTIAL**

**Evidence**

- `packages/go/database/database.go` — `go-redis` UniversalClient
- `services/auth-service/internal/store/redis.go`
- `docker-compose.yml` — Redis 7.4 on port 6380
- `config/.env.example` — `REDIS_URL`
- `services/README.md` catalog lists Redis for feed, live, recommendation, community, notification (mostly scaffold)

**Findings**

Redis client infrastructure exists; **production usage appears limited to auth-service** in implemented code. Feed/recommendation READMEs claim Redis but implementation depth not verified in all services.

**Risks**

Operational gap if README promises Redis but service is scaffold-only.

**Recommended fixes**

Implement Redis stores when feed/session scaling is required; document actual vs. planned.

**Priority**: P2

---

### 9. Kafka/event usage — **PARTIAL**

**Evidence**

- `packages/go/eventbus/eventbus.go` — kafka-go producer with OTel propagation
- Producers: `services/auth-service/internal/eventbus/producer.go`, `profile-service/internal/eventbus/producer.go`
- Consumers: `services/profile-service/internal/consumer/auth_user_registered.go`, `services/analytics-service/internal/consumer/*`
- `services/event-gateway` — HTTP → Kafka (`internal/kafka/producer.go`, `internal/gateway/server.go`)
- `docker-compose.yml` — Kafka 3.8 + Schema Registry
- `infrastructure/kafka/topics.yaml`
- Event protos: `packages/events/schemas/**`
- ADR 0008, 0036, 0039

**Findings**

Event pipeline is **real but narrow**: auth emits, profile consumes `user_registered`, analytics sinks to ClickHouse, event-gateway ingests HTTP events. Most services do not yet produce/consume.

**Risks**

Dual topic catalog / envelope models (Phase 10 P1). Replay mechanism documented but not implemented.

**Recommended fixes**

Collapse to proto source of truth (ADR 0039); expand consumers with integration tests; implement replay.

**Priority**: P1

---

### 10. ClickHouse/analytics usage — **PARTIAL**

**Evidence**

- `docker-compose.yml` — ClickHouse 24.10
- `services/analytics-service/internal/clickhouse/writer.go`, `writer_test.go`
- `services/analytics-service/cmd/server/main.go` — ClickHouse HTTP writer + Kafka consumer
- `packages/database/src/clickhouse.ts` (TS client stub)
- ADR 0035
- `infrastructure/clickhouse/migrations/001_event_analytics.sql`

**Findings**

Analytics path is implemented for event ingestion → ClickHouse. Broader moderation/trust ClickHouse usage is documented but not verified in functional service code.

**Risks**

ClickHouse schema evolution not tied to service migrations.

**Recommended fixes**

Version CH migrations in infrastructure; contract tests for analytics writer.

**Priority**: P2

---

### 11. Authentication and authorization — **PARTIAL**

**Evidence**

- `services/auth-service` — sessions, JWT issuer (`internal/tokens/issuer.go`), proto `SessionService`
- `services/access-control-service` — `authz_service.go`, Rego ADR 0022
- `services/session-service`, `notification-auth-service`, `account-recovery-service`
- `packages/go/auth/auth.go` — JWT/JWKS validation
- `packages/auth-sdk` — jose-based client/server helpers
- `services/api-gateway/internal/authz/middleware.go` — JWT on GraphQL
- `apps/auth-portal` — sign-in/sign-up UI (credential flow marked future in comments)
- ADR 0012

**Findings**

Identity **microservices are functional** with integration tests on auth/profile sessions. End-user auth portal and web app **do not show live GraphQL auth wiring** in grep (demo-first apps).

**Risks**

JWKS path tested only lightly; 10+ identity services have zero Go tests.

**Recommended fixes**

E2E auth flow: auth-portal → api-gateway → auth-service; mandatory JWT unit tests.

**Priority**: P1

---

### 12. User/project/video generation domain model — **PARTIAL**

**Evidence**

- User/session: `services/auth-service/internal/domain/session.go`, `services/profile-service/internal/domain/*`
- Video/media: `services/media-service`, `upload-service`, `transcoding-service`, `media-processing-orchestrator/internal/saga/saga.go`
- Clip/video intelligence protos: `clip-generation-service`, `video-segmentation-service` (scaffold)
- AI stubs: `ai/video-intelligence`, `ai/highlight-detection`, etc. (`__init__.py` only)
- Feed/rec: `services/feed-service/internal/domain/`, `recommendation-service/internal/domain/`

**Findings**

**Core user + media orchestration domain exists in Go** for implemented services. **Generation** (clips, segments, candidates) is **proto + README only**. AI packages are placeholders.

**Risks**

Product UI (studio upload, clip features) may assume backends that are scaffolds.

**Recommended fixes**

Sequence media pipeline completion before generation UX; align proto with saga states.

**Priority**: P1

---

### 13. Queue/job lifecycle — **PARTIAL**

**Evidence**

- `services/transcoding-service/proto/transcoding/v1/transcoding.proto` — `SubmitJob`, job status RPCs
- `services/transcoding-service/internal/api/transcoding_service.go`, `internal/store/postgres.go`
- `services/media-processing-orchestrator/internal/saga/saga.go` — orchestration
- Rust worker: `services/media-service/transcoder` (Cargo workspace member) — separate Kafka contract per runtime audit
- No `asynq`, `river`, `temporal`, or `machinery` in codebase

**Findings**

Job lifecycle is **Postgres-coordinated gRPC** for transcoding plus **saga orchestrator**; duplicate Rust Kafka worker creates **two job contracts**. No general-purpose queue abstraction.

**Risks**

Split-brain transcode processing; ops confusion on which path is canonical.

**Recommended fixes**

ADR-led consolidation: coordinator = `transcoding-service`, worker = `transcoding-service/worker/`; orchestrator calls coordinator only.

**Priority**: P1

---

### 14. Frontend apps — **PASS**

**Evidence**

- 14 apps with `package.json`: `web`, `studio`, `mobile`, `tv`, `immersive`, `auth-portal`, `admin`, `account-center`, `live-control-room`, `studio-media-console`, etc.
- Large feature surface under `apps/web/src/features/**`, `apps/studio/src/features/**`
- Vitest tests in web/studio (10 test files under `apps/`)
- ADR 0014, 0015

**Findings**

Experience layer is **broad, cinematic, and package-driven** (`@next/design-system`, `@next/player-ui`, etc.). Suitable for UX iteration and demos.

**Risks**

Surface area exceeds backend integration; maintenance cost.

**Recommended fixes**

Prioritize wiring high-traffic routes (home, watch, feed) to real APIs.

**Priority**: P2

---

### 15. Frontend/backend contract alignment — **FAIL**

**Evidence**

- `apps/web/src/lib/demo-*.ts` — 13 demo data modules (feed, watch, live, monetization, communities, etc.)
- Widespread imports of demo libs in features (e.g. `live-events-experience.tsx`, `monetization-hub.tsx`)
- `config/.env.example` — `NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql`
- `apps/web` grep: **no** `useQuery` / `ApolloClient` / `graphql` in `src/`
- `packages/api-client/src/grpc.ts` — stub comment: generated stubs under `src/__generated__/grpc/`
- `api-gateway` only wires auth + profile gRPC — `services/api-gateway/cmd/server/main.go`

**Findings**

Frontend is **largely decoupled from implemented backends**, using local demo fixtures. Contract packages exist (`@next/auth-sdk`, `@next/media-sdk`, `@next/recommendation-sdk`) but **web app does not consume live GraphQL** in inspected paths.

**Risks**

False sense of product completeness; integration surprises at MVP cutover.

**Recommended fixes**

1. Define MVP route → API matrix.
2. Replace demo-* module-by-module with api-client + React Query.
3. Expand api-gateway subgraphs for feed/media.

**Priority**: P0 for production MVP / P1 for integration milestone

---

### 16. Shared packages — **PASS**

**Evidence**

- 77 `packages/*/package.json` — UI, SDKs, events, types, design-system
- Go shared: `packages/go/{auth,database,eventbus,telemetry}`
- Rust: `packages/rust/{eventbus,telemetry,proto}`
- Events: `packages/events` (TS + proto schemas)
- `pnpm-workspace.yaml` catalog alignment

**Findings**

Package boundaries are clean; no backend logic in TS packages per Phase 10 package audit (referenced). SDKs align with service domains.

**Risks**

Some UI packages are placeholder-heavy (`commerce-ui/checkout-placeholder.tsx`, `broadcast-ui/ingest-placeholders.tsx`).

**Recommended fixes**

Tag packages as `experimental` in README where placeholder.

**Priority**: P2

---

### 17. Environment/config handling — **PASS**

**Evidence**

- `config/.env.example` — centralized defaults for data tier, OTel, public URLs, JWT
- Services use `github.com/caarlos0/env` (e.g. `analytics-service/internal/config/config.go`, `api-gateway` inline config struct)
- Turbo `globalEnv` in `turbo.json`
- Vault/External Secrets in `infrastructure/kubernetes/charts/next-service/templates/externalsecret.yaml`
- ADR 0010

**Findings**

Consistent env-parse pattern in Go; documented local ports avoiding 5432/6379 collisions.

**Risks**

Single `.env.example` may not list every service-specific variable.

**Recommended fixes**

Per-service README env tables; validate with env test in CI.

**Priority**: P3

---

### 18. Docker/dev environment — **PASS**

**Evidence**

- `docker-compose.yml` — Postgres, Redis, Kafka, Schema Registry, ClickHouse, OpenSearch, Qdrant, OTel Collector, Jaeger, Prometheus, Grafana
- `Taskfile.yml` — `dev:up` references compose
- `infrastructure/monitoring/otel-collector/local.yaml`

**Findings**

Local data tier is **production-realistic** and matches constitution stack targets.

**Risks**

Resource-heavy; not all services have compose profiles to start automatically.

**Recommended fixes**

Add `docker-compose.override` profiles per domain team.

**Priority**: P3

---

### 19. CI/CD — **PASS**

**Evidence**

- `.github/workflows/ci.yml` — path-filtered TS (turbo lint/typecheck/test/build), Go (test per service + golangci-lint), Rust, Python, buf, terraform, k8s
- `.github/workflows/security.yml` — CodeQL, dependency-review, semgrep, trivy, gitleaks
- `.github/workflows/image-build.yml`, `release.yml`, `preview-env.yml`, `terraform-plan.yml`, `terraform-apply.yml`
- Concurrency groups; Turbo remote cache env

**Findings**

CI is **mature and polyglot-aware**. Changesets/release pipeline present at root.

**Risks**

Go lint `working-directory: services` may not lint `packages/go/*` equally.

**Recommended fixes**

Add explicit `packages/go` to golangci scope.

**Priority**: P2

---

### 20. Observability/logging/tracing/metrics — **PARTIAL**

**Evidence**

- `packages/go/telemetry/telemetry.go` — OTel init pattern
- Functional services call `telemetry.Init` in `cmd/server/main.go`
- `docker-compose.yml` + `infrastructure/monitoring/**` — Prometheus, Grafana dashboards, alerting rules, SLO yaml
- `packages/logger`, `packages/frontend-utils/src/telemetry`
- ADR 0009
- slog JSON in Go mains

**Findings**

Instrumentation pattern is **consistent on functional services**. Dashboards exist for event-bus and golden signals.

**Risks**

20 scaffolds have no metrics; frontend OTel usage minimal (`apps/web/src/lib/telemetry.ts` only).

**Recommended fixes**

Require `/metrics` + service dashboards before prod-candidate promotion.

**Priority**: P2

---

### 21. Testing coverage — **FAIL**

**Evidence**

- Go tests in `services/`: **13 files** (`*_test.go`), concentrated in:
  - `feed-service/internal/domain/*_test.go` (3)
  - `recommendation-service/internal/domain/*_test.go` (4)
  - `event-gateway` (3)
  - `analytics-service` (2)
  - `auth-service`, `profile-service` integration tests (1 each)
- Apps tests: **10** vitest files under `apps/`
- Packages: grep found **no** `*.test.ts` under `packages/` (UI packages largely untested)
- `docs/audits/service-maturity-matrix.md` — SM-1 near-zero coverage

**Findings**

Testing is **far below production bar**. Only feed/recommendation have meaningful domain unit tests.

**Risks**

Regressions in identity/media paths undetected; JWT/session bugs latent.

**Recommended fixes**

Mandate: domain unit tests + one store integration test per functional service before prod-candidate.

**Priority**: P1

---

### 22. Build/lint/typecheck status — **UNKNOWN**

**Evidence**

- CI definitions exist (section 19)
- Root scripts: `pnpm turbo run lint typecheck test build`

**Findings**

**Not executed in this audit** (Ask/read-only subagent constraints). Local git status shows extensive uncommitted WIP which may affect CI on a dirty branch.

**Risks**

Type errors or test failures may exist in uncommitted app work.

**Recommended fixes**

Run `pnpm turbo run lint typecheck test build` and `go test ./...` on clean branch; record in CI badge.

**Priority**: P2

---

### 23. Security risks — **PARTIAL**

**Evidence**

- `security.yml` — CodeQL (JS/Go/Python), dependency-review, semgrep OWASP, trivy, gitleaks
- `event-gateway/internal/security/auth.go` — HMAC producer auth; `AllowUnsignedEvents` dev flag
- PII scrub list in `event-gateway/internal/events/envelope.go`
- Kyverno policies: `infrastructure/security/kyverno/policies.yaml`
- No hardcoded live secrets found in grep sample (password fields are field names/config keys)

**Findings**

Security **tooling is strong**; runtime posture depends on correct prod config (unsigned events off, secrets from Vault).

**Risks**

`AllowUnsignedEvents` misconfiguration in prod; demo apps bypass real auth; large attack surface from 14 apps.

**Recommended fixes**

Integration test that prod config rejects unsigned events; auth E2E tests.

**Priority**: P2

---

### 24. Performance risks — **PARTIAL**

**Evidence**

- Rust hot paths: transcoder, ranker, live ingest
- Feed pacing/experiments domain code in `feed-service`
- Turbo build caches; remote cache signature in CI
- OpenSearch/Qdrant in compose for search/vector paths (scaffold services)

**Findings**

Performance-sensitive paths identified in architecture; **duplicate transcode** and **unbounded UI demo data** are logical perf risks. No load test artifacts inspected.

**Risks**

Kafka single-broker local config not representative; feed without Redis implementation may not scale as documented.

**Recommended fixes**

Load test feed + recommendation; resolve transcode duplication before perf tuning.

**Priority**: P2

---

### 25. Incomplete TODOs/stubs/placeholders — **PARTIAL**

**Evidence**

- 20 scaffold backend services
- 22 AI packages with empty `__init__.py` stubs
- UI placeholders: `packages/commerce-ui/src/checkout-placeholder.tsx`, `packages/broadcast-ui/src/ingest-placeholders.tsx`, multiple `*-placeholder*` components
- `apps/auth-portal` sign-in comments defer credential ceremony
- Services README vs implementation gap

**Findings**

Stubs are **pervasive but documented**. Not hidden debt — structural phase state.

**Risks**

Placeholder UI shipped as if real; proto/API promises without implementation.

**Recommended fixes**

Mark surfaces with feature flags; track in `docs/technical-debt/technical-debt-register.md`.

**Priority**: P2

---

### 26. Broken imports or dead code — **UNKNOWN**

**Evidence**

- `gen/go` populated (generated)
- No automated dead-code analysis run

**Findings**

Cannot confirm broken imports without `tsc` / `go build` / `cargo check` in this run.

**Risks**

Uncommitted WIP in `apps/web`, `apps/studio` may contain broken paths.

**Recommended fixes**

Run full monorepo build on CI main; enable knip or similar for TS dead exports.

**Priority**: P2

---

### 27. Architecture drift from approved rules — **PARTIAL**

**Evidence**

- Constitution: `.cursor/rules/next-master-constitution.mdc`, `AGENTS.md`
- ADRs 0001–0039 including 0038 layout, 0039 events, 0037 workers
- Phase 10 audits: `docs/audits/phase-10-system-integration-audit.md`, `runtime-boundary-audit.md`, `multi-agent-drift-report.md`
- Drift items: dual transcode, dual event catalog, two Go layouts, misplaced Rust workers

**Findings**

**No outright ADR violations** in shipped code; drift is **gaps and duplications** where ADRs were added after implementation (0038, 0039, 0037).

**Risks**

Continued parallel agent work without ADR adherence recreates drift.

**Recommended fixes**

Execute Phase 10 five P1 items before next feature wave; enforce PR template ADR gate.

**Priority**: P1

---

### 28. MVP readiness — **FAIL** (production) / **PARTIAL** (demo)

**Evidence**

Synthesis of sections 15, 21, 13, 9, 2, and Phase 10 verdict.

**Findings**

| MVP tier | Verdict | Rationale |
|----------|---------|-----------|
| **Local demo** | Achievable | docker-compose + 19 services + rich UI with demo data |
| **Identity MVP** | Partial | auth/profile/session work; portal not fully wired |
| **Watch/feed MVP** | Partial | feed/recommendation strong; web uses demo libs |
| **Production MVP** | Not ready | contract gap, test gap, 51% services scaffold, transcode duplication |

**Risks**

Shipping demo as product; operational runbooks incomplete for 20 services.

**Recommended fixes**

See Top 20 fixes below; gate MVP on integration checklist.

**Priority**: P1

---

## 4. Top 20 risks (ranked)

| Rank | Risk | Severity | Evidence |
|------|------|----------|----------|
| 1 | Web/studio apps use demo data, not live APIs | P0 | `apps/web/src/lib/demo-*.ts`, no GraphQL in web `src/` |
| 2 | 51% backend services are non-runnable scaffolds | P1 | 20/39 without `cmd/server` |
| 3 | Near-zero Go test coverage on identity/media | P1 | 13 `*_test.go` files; SM-1 |
| 4 | Duplicate transcoding (Rust vs Go coordinator) | P1 | `media-service/transcoder` vs `transcoding-service` |
| 5 | GraphQL gateway only exposes auth+profile | P1 | `api-gateway/cmd/server/main.go` |
| 6 | Dual event topology / envelope models | P1 | Phase 10; ADR 0039 not fully applied |
| 7 | Two Go `internal/` layout families | P2 | ADR 0038 vs analytics/event-gateway |
| 8 | Kafka event mesh mostly unconnected | P2 | Few producers/consumers |
| 9 | Auth portal / JWT path not E2E verified | P1 | auth-portal comments; thin tests |
| 10 | Job lifecycle split-brain | P1 | Kafka transcode vs gRPC SubmitJob |
| 11 | AI layer entirely stub | P2 | 22 `ai/*` `__init__.py` only |
| 12 | community-service / live-service irregular | P2 | No proto / no Go server |
| 13 | Redis documented but lightly implemented | P2 | Mostly auth-service store |
| 14 | ClickHouse only on analytics path | P2 | Other CH claims unverified |
| 15 | Placeholder commerce/broadcast UI | P2 | `checkout-placeholder.tsx`, etc. |
| 16 | Large uncommitted WIP tree | P2 | git status snapshot |
| 17 | Proto/API promises ahead of implementation | P2 | 20 scaffolds with protos |
| 18 | `AllowUnsignedEvents` misconfig in prod | P2 | event-gateway config |
| 19 | Build health unknown on branch | P2 | Section 22 not run |
| 20 | Ranker location ambiguity | P2 | `recommendation-service/ranker` vs `ranking-service` |

---

## 5. Top 20 recommended fixes (ranked)

| Rank | Fix | Priority | Owner hint |
|------|-----|----------|------------|
| 1 | Publish MVP route → API matrix; wire web home/watch/feed off api-gateway | P0 | Frontend + platform |
| 2 | Expand api-gateway subgraphs (feed, media, upload) as services ready | P1 | Platform |
| 3 | Replace `demo-*` modules incrementally with `@next/*-sdk` + React Query | P1 | Web |
| 4 | Reconcile transcoding: move Rust worker under `transcoding-service/worker/` | P1 | Media |
| 5 | Mandate test bar per service (domain + store integration) | P1 | All backend |
| 6 | Backfill auth/JWT/session unit + integration tests | P1 | Identity |
| 7 | Apply ADR 0039 — single event schema source; deprecate duplicate catalog | P1 | Platform |
| 8 | Migrate analytics/event-gateway to canonical `eventbus`/`consumer` layout | P2 | Platform |
| 9 | Normalize `community-service` and `live-service` scaffolds | P2 | Social/live |
| 10 | Implement next scaffold batch in roadmap dependency order | P2 | Domain owners |
| 11 | E2E test: auth-portal → gateway → auth-service | P1 | Identity |
| 12 | Run and gate CI `pnpm turbo` + `go test` on main | P2 | DevEx |
| 13 | Document actual Redis/CH usage per service README | P2 | Backend |
| 14 | Feature-flag placeholder UI packages | P2 | Frontend |
| 15 | Resolve ranking-service vs recommendation ranker ADR | P2 | Discovery |
| 16 | Add golangci scope for `packages/go` | P3 | DevEx |
| 17 | Implement event replay mechanism | P2 | Platform |
| 18 | knip/dead-code scan on `apps/` and `packages/` | P3 | DevEx |
| 19 | Load test feed + recommendation before scale claims | P2 | Discovery |
| 20 | Enforce `_template` + buf breaking on all new services | P2 | Governance |

---

## 6. MVP readiness verdict

| Criterion | Assessment |
|-----------|------------|
| **Production MVP** | **Not ready** |
| **Stakeholder demo MVP** | **Ready with caveats** (local compose, demo UI, subset of backends) |
| **Identity-only MVP** | **Partial** (services exist; portal integration incomplete) |
| **Creator upload MVP** | **Partial** (upload/media/transcode path started; duplication risk) |

**Blocking items for production MVP**: frontend contract alignment (#15), test coverage (#21), transcode/job consolidation (#13), event topology consolidation (#9).

---

## 7. Confidence level

**Medium**

| Factor | Impact |
|--------|--------|
| Direct inspection of repo structure, services, protos, CI, compose, ADRs | Raises confidence |
| Existing Phase 10 audits aligned with findings | Raises confidence |
| Did not run build/test/typecheck in this session | Lowers confidence |
| Did not line-by-line audit all 19 functional services | Lowers confidence |
| Large uncommitted working tree may differ from `main` | Lowers confidence |

---

## 8. Questions and assumptions

**Assumptions**

- Audit reflects workspace snapshot 2026-05-20; git status showed extensive uncommitted files in apps/packages/docs.
- "Functional" = presence of `cmd/server` + `internal/api` + store (consistent with `service-maturity-matrix.md`).
- Production MVP implies real API integration, not demo fixtures.
- Constitution and ADRs in `docs/adr/` are the approved rule set.

**Questions for maintainers**

1. What is the target MVP slice: identity-only, watch+feed, or full creator pipeline?
2. Is `main` branch intended to match this working tree, or are agent branches still unmerged?
3. Canonical transcode path: retire Rust Kafka worker or retire gRPC coordinator?
4. Should web MVP ship with demo data behind a flag while APIs catch up?
5. Required test coverage threshold for `prod-candidate` promotion?

---

## Appendix A — Service inventory (39)

**Functional (19)**: api-gateway, auth-service, profile-service, session-service, access-control-service, trust-service, device-graph-service, creator-identity-service, account-recovery-service, notification-auth-service, identity-graph-service, upload-service, media-service, transcoding-service, media-processing-orchestrator, analytics-service, event-gateway, recommendation-service, feed-service

**Scaffold (20)**: community-service, live-service, moderation-service, notification-service, payment-service, search-service, discovery-service, personalization-service, ranking-service, candidate-generation-service, semantic-retrieval-service, cdn-routing-service, clip-generation-service, media-analytics-service, media-metadata-service, media-search-service, playback-service, subtitle-service, thumbnail-service, video-segmentation-service

---

## Appendix B — Key paths inspected

| Area | Paths |
|------|-------|
| Root tooling | `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `go.work`, `Cargo.toml`, `pyproject.toml`, `Taskfile.yml`, `buf.yaml`, `buf.gen.yaml` |
| Dev/infra | `docker-compose.yml`, `config/.env.example`, `infrastructure/**`, `.github/workflows/*.yml` |
| Governance | `.cursor/rules/next-master-constitution.mdc`, `AGENTS.md`, `docs/standards/go-service-standards.md`, `docs/adr/0038-*.md`, `docs/governance/runtime-governance.md` |
| Audits | `docs/audits/service-maturity-matrix.md`, `phase-10-system-integration-audit.md`, `runtime-boundary-audit.md` |
| Backend | `services/*/go.mod`, `cmd/server/main.go`, `migrations/`, `proto/` |
| Frontend | `apps/*/package.json`, `apps/web/src/lib/demo-*.ts`, `packages/api-client/` |
| Shared Go | `packages/go/{auth,database,eventbus,telemetry}/` |
| Codegen | `gen/go/**` |

---

*End of audit — Composer*
