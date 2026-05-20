# NEXT — Repository Audit (COPILOT)

**Auditor:** GitHub Copilot (implementation accelerator agent)
**Date:** 2026-05-20
**Mode:** Read-only inspection. No product code modified.
**Branch context:** working tree (untracked + uncommitted state included in observations)
**Cross-reference:** Claude's audit `IMPLEMENTATION_STATUS.md` (2026-05-20)

---

## 1. Executive Summary

NEXT is a polyglot monorepo (Go services, Rust media/ranking components, Python AI subsystems, TypeScript apps + packages) with **broad scaffolding and shallow implementation**. Of **39 service directories** under `/services/*` (excluding `_template`), **19 contain Go implementations** and **20 are scaffold-only**. The approved `cmd/server` + `internal/{api,domain,store,eventbus,consumer}` layout is honored in spirit but applied **inconsistently**: only 5 services carry `internal/domain`, only 2 have `internal/eventbus`, and only 2 have `internal/consumer`.

The identity cluster is the most complete. The video pipeline is wired through ingest → state → orchestration → transcoding ladder, but the **entire delivery half (playback, CDN routing, thumbnail, subtitle, segmentation) is unimplemented**, so no end-to-end video watch is possible. The event mesh is fully **defined** (topic catalog, gateway, analytics consumer) but largely **unwired** at producers. Observability tooling and CI/CD pipelines are mature; deployment surface (Dockerfiles, K8s manifests) is barely present (2 of 19 services).

Three concrete defects: (1) a committed Windows binary `services/auth-service/server.exe`, (2) orphan generated packages `gen/go/audit/` and `gen/go/payment/` with no source proto, (3) `identity-graph-service` has `cmd` + `proto` but no `store` and no `migrations`.

**MVP readiness:** **NOT READY.** The platform cannot deliver its core promise (watch a video) end-to-end. Recommended path: complete the delivery half of the media pipeline + wire event production into media/orchestrator + close the deployment surface before any new feature work.

**Backend Go-only compliance:** PASS. No Node/TS backend services exist; `/services/*` is uniformly Go.

---

## 2. Checklist Status Table

| # | Section | Status | Priority of gaps |
|---|---|---|---|
| 1 | Monorepo structure | **PASS** | — |
| 2 | Backend service structure | **PARTIAL** | P1 |
| 3 | Go-only backend compliance | **PASS** | — |
| 4 | Protobuf definitions | **PARTIAL** | P1 |
| 5 | gRPC APIs | **PARTIAL** | P1 |
| 6 | Database migrations | **PARTIAL** | P2 |
| 7 | PostgreSQL usage | **PARTIAL** | P2 |
| 8 | Redis usage | **PARTIAL** | P2 |
| 9 | Kafka / event usage | **PARTIAL** | P1 |
| 10 | ClickHouse / analytics | **PARTIAL** | P2 |
| 11 | AuthN / AuthZ | **PARTIAL** | P1 |
| 12 | User / project / video domain model | **PARTIAL** | P0 (delivery half) |
| 13 | Queue / job lifecycle | **PARTIAL** | P1 |
| 14 | Frontend apps | **PARTIAL** | P2 |
| 15 | Frontend/backend contract alignment | **UNKNOWN** | P1 |
| 16 | Shared packages | **PARTIAL** | P2 |
| 17 | Environment / config handling | **PARTIAL** | P2 |
| 18 | Docker / dev environment | **PARTIAL** | P1 |
| 19 | CI / CD | **PASS** | P3 |
| 20 | Observability / logging / tracing / metrics | **PASS** | P3 |
| 21 | Testing coverage | **FAIL** | P1 |
| 22 | Build / lint / typecheck status | **UNKNOWN** | P2 |
| 23 | Security risks | **PARTIAL** | P0 (committed binary) |
| 24 | Performance risks | **UNKNOWN** | P2 |
| 25 | Incomplete TODOs / stubs / placeholders | **PARTIAL** | P1 |
| 26 | Broken imports / dead code | **PARTIAL** | P1 |
| 27 | Architecture drift from approved rules | **PARTIAL** | P1 |
| 28 | MVP readiness | **FAIL** | P0 |

---

## 3. Detailed Findings by Section

### 1. Monorepo Structure — PASS

**Evidence:** `go.work`, `Cargo.toml`, `pyproject.toml`, `pnpm-workspace.yaml`, `turbo.json`, `Taskfile.yml`, `buf.yaml`, `buf.gen.yaml`, `.mise.toml`, `.nvmrc`, `.npmrc`.

**Findings:** `go.work` enumerates 4 shared modules + 39 service modules. Polyglot orchestration is coherent: Turbo for JS/TS, Taskfile for Go/Rust/Python/Terraform/K8s, Buf for proto. `package.json` exposes consistent commands (`build`, `test`, `lint`, `typecheck`, `format`, `codegen`).

**Risks:** None blocking.
**Recommended fixes:** None. Maintain discipline as the workspace grows.
**Priority:** —

---

### 2. Backend Service Structure — PARTIAL

**Evidence:** `services/*` directory inventory (39 services + `_template`).

**Structural matrix (per service):**

| Group | cmd | proto | migrations | store | domain | eventbus | consumer |
|---|---|---|---|---|---|---|---|
| Implemented (19) | 19 | 17 | 17 | 16 | 5 | 2 | 2 |
| Scaffold-only (20) | 0 | 15 | 0 | 0 | 0 | 0 | 0 |

**Findings:**
- `internal/domain` present only in: `auth-service`, `feed-service`, `media-service`, `profile-service`, `recommendation-service`. Most identity-cluster services keep business logic directly in `internal/api`.
- `internal/eventbus` present only in: `auth-service`, `profile-service`.
- `internal/consumer` present only in: `profile-service`, `analytics-service`.
- `event-gateway` deviates intentionally (uses `internal/gateway` + no `proto/`) — undocumented exception.
- `analytics-service` writes to ClickHouse — has no `proto/` and no `migrations/` (ClickHouse schema lives under `infrastructure/clickhouse/migrations/`). Defensible but undocumented exception.
- `identity-graph-service` has `cmd` + `proto` but **no `store`, no `migrations`** — a clear gap for a persistence service.

**Risks:** Template drift compounds with four parallel agents. Business logic in `internal/api` makes future event/saga work harder to place.
**Recommended fixes:** (a) Add `internal/domain` placeholders to the 14 implemented services that lack it. (b) Ratify and document `event-gateway` / `analytics-service` exceptions in `docs/ARCHITECTURE.md`. (c) Add `store` + `migrations/001_init.{up,down}.sql` to `identity-graph-service`.
**Priority:** **P1**

---

### 3. Go-only Backend Compliance — PASS

**Evidence:** `/services/*` directory scan; no `package.json`, no `Cargo.toml` inside any service except Rust components (`live-service/ingest`, `media-service/transcoder`, `recommendation-service/ranker`) intentionally listed in root `Cargo.toml`.

**Findings:** Every backend service is Go-native. No Node/TS/Zod/Express/Nest services exist. Rust components are isolated to media/ranking hotspots and integrated via the workspace.

**Risks:** None.
**Recommended fixes:** None.
**Priority:** —

---

### 4. Protobuf Definitions — PARTIAL

**Evidence:** `buf.yaml`, `buf.gen.yaml`, `gen/go/*`, 50 `.proto` files across `services/*/proto/*/v1/*.proto`.

**Findings:**
- `buf.yaml` enumerates 31 modules + `packages/events/schemas`.
- **Orphan generated packages:** `gen/go/audit/` and `gen/go/payment/` exist with no corresponding source `.proto` in `buf.yaml` (no `audit-service` exists; `payment-service` is scaffold-only). These are stale codegen artifacts.
- **Services missing `.proto`:** `community-service`, `moderation-service`, `notification-service`, `payment-service`, `search-service` (and `live-service` — Rust-only). None of these are present in `buf.yaml`.
- Proto governance is otherwise sound: `enum_zero_value_suffix: _UNSPECIFIED`, `service_suffix: Service`, breaking-change rules (`FILE`), standard lint with sensible exceptions.

**Risks:** Stale `gen/go` can mask drift; CI proto-breaking checks rely on the listed modules being current.
**Recommended fixes:** Delete `gen/go/audit/` and `gen/go/payment/`. Run `buf generate` to regenerate `gen/go` cleanly. Either add `.proto` for the 5 missing services or remove them from proto governance until contracts are defined.
**Priority:** **P1**

---

### 5. gRPC APIs — PARTIAL

**Evidence:** `internal/api/*_service.go` across the 19 implemented services; embedding pattern `XxxV1.UnimplementedXxxServiceServer`.

**Findings:** All 19 implemented services follow the gRPC pattern with `Unimplemented*Server` forward-compat embeds (good). One **explicit deliberate stub**: `auth-service/internal/api/session_service.go:107` — `SessionService.Refresh` returns `codes.Unimplemented` with comment "refresh implemented in Phase 3 with OIDC code path". 20 services have no API surface yet.

**Risks:** Session refresh is a known production-blocker; cannot complete real auth flows.
**Recommended fixes:** Track Phase-3 OIDC work as a P1 milestone for auth. Implement gRPC surfaces for at least `playback-service` to unblock the watch flow.
**Priority:** **P1**

---

### 6. Database Migrations — PARTIAL

**Evidence:** `services/*/migrations/001_init.{up,down}.sql` (17 pairs).

**Findings:** 17 services have an `001_init` pair using the canonical `NNN_*.{up,down}.sql` convention. No service has progressed past migration 001 (expected for current phase). **`identity-graph-service` has no migrations** despite being a persistence domain. ClickHouse migrations live at `infrastructure/clickhouse/migrations/001_event_analytics.sql`.

**Risks:** No schema-evolution tooling has been exercised; first migration past 001 will reveal whether the runner/CI handles it.
**Recommended fixes:** Add migrations for `identity-graph-service`. Document the migration runner in `docs/database-architecture.md` and exercise a no-op `002_*.sql` in CI to prove the pipeline.
**Priority:** **P2**

---

### 7. PostgreSQL Usage — PARTIAL

**Evidence:** `packages/go/database`, `services/*/internal/store/postgres.go` files.

**Findings:** Shared `packages/go/database` provides Postgres helpers; 16 services have a `store/` layer. Per-service schemas exist (001_init migrations). No global multi-tenant or sharding strategy is visible in code — relies on per-service DBs (canonical microservice pattern).

**Risks:** No connection-pool tuning, no readiness/health probes verified in code samples inspected.
**Recommended fixes:** Verify each `store/postgres.go` uses `pgxpool` with sane defaults (max-conns, idle, lifetime) and exports a health-check.
**Priority:** **P2**

---

### 8. Redis Usage — PARTIAL

**Evidence:** `packages/database/src/redis.ts` (TS-side), shared Go database helpers, `auth-service` references session storage.

**Findings:** Redis is documented as the session/cache layer; auth/session services depend on it. Other services that should cache (feed, recommendation, playback manifests) do not visibly use Redis yet.

**Risks:** Cache strategy is uncodified — future hot-path services may each invent their own pattern.
**Recommended fixes:** Add a shared Go Redis client wrapper (if not already in `packages/go/database`) and document cache key/TTL conventions in `docs/database-architecture.md`.
**Priority:** **P2**

---

### 9. Kafka / Event Usage — PARTIAL

**Evidence:** `infrastructure/kafka/topics.yaml`, `packages/events/schemas/*/v1/*.proto`, `services/event-gateway`, `services/analytics-service/internal/consumer`, `services/auth-service/internal/eventbus`, `services/profile-service/internal/{eventbus,consumer}`.

**Findings:** Topic catalog covers 11 families + 4 DLQs. `event-gateway` is the HTTP→Kafka ingress (idempotency, ratelimit, envelope). `analytics-service` is the implemented ClickHouse sink consumer. **Producers exist in only 2 services** (`auth`, `profile`). Media, recommendation, feed, trust, creator-identity own topic families but emit no events.

**Risks:** The event mesh is aspirational at producer side. Analytics, recommendation, and downstream consumers have no real signal to consume.
**Recommended fixes:** Add `internal/eventbus` to `media-service` and `media-processing-orchestrator` first (highest signal volume). Then trust, creator-identity, feed.
**Priority:** **P1**

---

### 10. ClickHouse / Analytics — PARTIAL

**Evidence:** `infrastructure/clickhouse/migrations/001_event_analytics.sql`, `services/analytics-service/internal/consumer`.

**Findings:** Single ClickHouse migration; analytics-service is a Kafka→ClickHouse sink consumer. Dashboards exist in Grafana (`golden-signals`, `event-bus`).

**Risks:** ClickHouse schema is a single migration; retention/partitioning strategy not visible.
**Recommended fixes:** Document partition key (likely event-time) and retention policy; add a second migration exercising TTL.
**Priority:** **P2**

---

### 11. Authentication & Authorization — PARTIAL

**Evidence:** `services/auth-service`, `session-service`, `access-control-service`, `account-recovery-service`, `device-graph-service`, `notification-auth-service`, `identity-graph-service`, `api-gateway/internal/authz`, `packages/go/auth`.

**Findings:** AuthN is the most complete domain. AuthZ catalog + scopes exist in `access-control-service`. API gateway has authz middleware. `packages/go/auth` is the shared verification library. **Gap:** `SessionService.Refresh = Unimplemented`. **Gap:** `identity-graph-service` has no persistence.

**Risks:** No refresh path → real session lifecycles cannot be tested end-to-end.
**Recommended fixes:** Schedule Phase-3 OIDC + refresh as the next auth milestone. Add identity-graph persistence.
**Priority:** **P1**

---

### 12. User / Project / Video Domain Model — PARTIAL (delivery half FAIL)

**Evidence:** `services/{upload,media,media-processing-orchestrator,transcoding,playback,cdn-routing,thumbnail,subtitle,video-segmentation}-service`, `services/feed-service`, `services/recommendation-service`.

**Findings:** Pipeline state map:

| Stage | Service | Status |
|---|---|---|
| Upload (resumable, blob) | upload-service | **Implemented** |
| Media lifecycle SM (`UPLOADING→…→PUBLISHED/FAILED`) | media-service | **Implemented** |
| Saga orchestration | media-processing-orchestrator | **Implemented** |
| Transcoding ladder | transcoding-service | **Implemented** (Go); Rust transcoder is a stub |
| Thumbnails | thumbnail-service | **Scaffold only** |
| Subtitles | subtitle-service | **Scaffold only** |
| Segmentation | video-segmentation-service | **Scaffold only** |
| Playback / manifest signing | playback-service | **Scaffold only** (proto exists) |
| CDN routing | cdn-routing-service | **Scaffold only** |
| Feed | feed-service | Implemented |
| Recommendation | recommendation-service | Implemented |

**A user cannot currently watch a video end-to-end.** This is the central MVP blocker.

**Risks:** Highest. Without delivery, the entire video product is undeliverable regardless of upload/ingest maturity.
**Recommended fixes:** Implement `playback-service` first (proto already exists), then `thumbnail-service` and `subtitle-service`, then `cdn-routing-service`. Wire event emission so downstream consumers (analytics, search indexing) receive real signal.
**Priority:** **P0**

---

### 13. Queue / Job Lifecycle — PARTIAL

**Evidence:** `media-processing-orchestrator` (saga coordinator), `transcoding-service`.

**Findings:** Saga pattern exists for media processing. No general-purpose job/queue abstraction is visible. No DLQ handling code observed beyond the topic-catalog declarations.

**Risks:** Job retries, idempotency, and DLQ replay are likely undertested.
**Recommended fixes:** Document saga compensation logic; add explicit DLQ consumer + replay tooling alongside `event-gateway`.
**Priority:** **P1**

---

### 14. Frontend Apps — PARTIAL

**Evidence:** `apps/{web,studio,admin,auth-portal,account-center,mobile,tv,immersive,live-control-room,studio-media-console}`.

**Findings:** `web` is substantial (181 TS/TSX per Claude's count); `studio` moderate (47); the rest are thin scaffolds or empty. **`live-control-room` and `studio-media-console` are empty (only `package.json`).** Composer (frontend agent) owns these — flagging without modifying.

**Risks:** No risks I can act on (frontend is Composer's domain).
**Recommended fixes:** Defer to Composer.
**Priority:** **P2**

---

### 15. Frontend ↔ Backend Contract Alignment — UNKNOWN

**Evidence:** `services/api-gateway` (gqlgen GraphQL Federation), `packages/api-client`, `gen/go/*`.

**Findings:** Backend exposes gRPC + GraphQL Federation via `api-gateway`. Frontend `packages/api-client` exists but its sync to actual server schemas was not verified in this audit. No automated contract-test job is visible in CI.

**Risks:** Drift between proto/GraphQL and frontend types is likely undetected.
**Recommended fixes:** Add a CI job that fails if codegen output differs from committed `gen/*` or `packages/api-client` types. Verify `apps/web` actually consumes generated types.
**Priority:** **P1**

---

### 16. Shared Packages — PARTIAL

**Evidence:** `packages/*` (78 directories, mixed Go + TS).

**Findings:** Go shared libs (`packages/go/{auth,database,eventbus,telemetry}`) are real and wired. Many TS packages are 1-file stubs (`access-control`, `permissions`, `media-sdk`, `upload-sdk`, `recommendation-sdk`, `feature-flags`, etc.). Substantive TS: `frontend-utils`, `layout-engine`, `ui`, `onboarding-ui`.

**Risks:** Stubs invite divergent re-implementation per consumer.
**Recommended fixes:** Tag each stub package with `// TODO(owner)` in its `src/index.ts` so consumers know it's a contract placeholder, not a working dep.
**Priority:** **P2**

---

### 17. Environment / Config Handling — PARTIAL

**Evidence:** `config/`, `.mise.toml`, `.nvmrc`, `infrastructure/secrets/`, `packages/config`.

**Findings:** Tooling versions pinned via `mise`. Secrets directory exists at infra layer. Per-service env loading was not exhaustively verified.

**Risks:** No 12-factor verification per service in this pass.
**Recommended fixes:** Audit each service's `cmd/server/main.go` for env-var loading; ensure `packages/config` (Claude-owned) defines the schema.
**Priority:** **P2**

---

### 18. Docker / Dev Environment — PARTIAL

**Evidence:** `docker-compose.yml`, `services/_template/Dockerfile`, `services/auth-service/Dockerfile`, `services/profile-service/Dockerfile`.

**Findings:** Docker compose boots the data tier (Postgres, Redis, Kafka, ClickHouse, otel-collector, Jaeger, Prometheus, Grafana). **Only 2 of 19 implemented services have a Dockerfile.** A template exists.

**Risks:** Cannot containerize most services for local or remote deployment.
**Recommended fixes:** Generate per-service Dockerfiles from `_template/Dockerfile` for the 17 missing services. Add them to `docker-compose.yml` (or per-service compose overrides) for local boot.
**Priority:** **P1**

---

### 19. CI / CD — PASS

**Evidence:** `.github/workflows/{ci,image-build,preview-env,release,security,terraform-plan,terraform-apply}.yml`.

**Findings:** 7 workflows. `ci.yml` uses path filters (`dorny/paths-filter`) per language; Go job runs `go test -race` + `golangci-lint`; proto job runs buf lint + breaking-check.

**Risks:** None obvious without running.
**Recommended fixes:** Add contract-drift check (see §15). Add a job that ensures committed `gen/go` matches `buf generate` output.
**Priority:** **P3**

---

### 20. Observability / Logging / Tracing / Metrics — PASS

**Evidence:** `infrastructure/monitoring/{otel-collector,prometheus,grafana,loki,tempo,alerting}`, `packages/go/telemetry`, `docs/observability.md`.

**Findings:** Stack is complete: otel-collector (agent + gateway + local modes), Prometheus, Grafana with 2 dashboards (golden-signals, event-bus), Loki, Tempo, alerting rules + SLOs + event-bus rules. Shared Go telemetry lib exists.

**Risks:** Coverage is only meaningful if services actually instrument. Currently most services have minimal instrumentation calls.
**Recommended fixes:** Pair instrumentation backfill with the §9 event-wiring work — services adding eventbus should also add otel spans + structured logs.
**Priority:** **P3**

---

### 21. Testing Coverage — FAIL

**Evidence:** 14 Go `*_test.go` files across the entire backend; `vitest.config.ts` in `apps/web` + `apps/studio`; `tests/e2e/playwright.config.ts`; `tests/load/feed.k6.ts`; `tests/backend/events/*`.

**Findings:**
- **Go: 14 test files total**, concentrated in `feed-service/internal/domain`, `recommendation-service/internal/domain`, `event-gateway`, `analytics-service`, plus integration tests in `auth-service` and `profile-service`. **17 of 19 implemented services have no unit tests.**
- E2E and load harness are scaffolded but content is minimal.
- Rust/Python: effectively no tests.

**Risks:** Refactors and four-agent parallel merges are unguarded against regressions. The constitution requires happy + edge + failure + validation tests per implementation — this is far from met.
**Recommended fixes:** Backfill unit tests on `internal/domain` and `internal/store` of all implemented services. Block new merges on a per-service test minimum.
**Priority:** **P1**

---

### 22. Build / Lint / Typecheck Status — UNKNOWN

**Evidence:** `package.json` scripts (`turbo run build`, `lint`, `typecheck`); `golangci-lint` referenced in CI.

**Findings:** Did not execute build/lint/typecheck in this audit (read-only mandate; would also be slow on this filesystem). Status of current working tree is unverified.

**Risks:** Working tree may not be green; orphan `gen/go/{audit,payment}` could cause unused-import warnings if referenced anywhere.
**Recommended fixes:** Run `pnpm typecheck`, `pnpm lint`, `task go:test`, `buf build` and record the baseline. Treat any failure as a P0 stop-the-line.
**Priority:** **P2**

---

### 23. Security Risks — PARTIAL

**Evidence:** `services/auth-service/server.exe` (binary committed), `SECURITY.md`, `infrastructure/secrets/`, `infrastructure/security/`, `.gitignore`.

**Findings:**
- **`services/auth-service/server.exe` is committed.** This is a Windows binary in the repo. Beyond bloat, compiled binaries can leak environment, paths, or strings; should never be in VCS.
- No hardcoded secrets observed in spot checks. `.gitignore` does not exclude `*.exe` or service build outputs (inferred from the binary being present).
- `security.yml` workflow exists.

**Risks:** Binary leakage; future build outputs may be re-committed by an unaware contributor.
**Recommended fixes:** Delete `services/auth-service/server.exe`. Add `*.exe`, `*.bin`, `bin/`, `dist/`, and per-service `server` outputs to `.gitignore`. Add a CI guard rejecting binaries.
**Priority:** **P0**

---

### 24. Performance Risks — UNKNOWN

**Evidence:** No load tests run; only `tests/load/feed.k6.ts` scaffold observed.

**Findings:** Unverifiable without running. Per-service performance posture (connection pools, N+1 queries, hot-path caching) was not inspected line-by-line.

**Risks:** Standard early-platform risks — N+1 in feed/recommendation, missing indexes, missing pagination caps.
**Recommended fixes:** Run the k6 harness against the implemented services in a staging-like env once playback exists.
**Priority:** **P2**

---

### 25. Incomplete TODOs / Stubs / Placeholders — PARTIAL

**Evidence:** grep across `services/*/internal/**/*.go`.

**Findings:**
- **Deliberate runtime stub:** `auth-service/internal/api/session_service.go:107` — `SessionService.Refresh` returns `codes.Unimplemented`.
- All other `Unimplemented*Server` references are the canonical gRPC forward-compat embed pattern — **not** actual unimplemented endpoints, just safety nets.
- 20 scaffold-only services are themselves placeholders.

**Risks:** `SessionService.Refresh` is a real production hole.
**Recommended fixes:** Track Phase-3 OIDC. Sweep TODOs across the working tree before Phase-5 starts.
**Priority:** **P1**

---

### 26. Broken Imports / Dead Code — PARTIAL

**Evidence:** `gen/go/audit/`, `gen/go/payment/` directories with no upstream `.proto`.

**Findings:** Two orphan generated packages exist. Anything importing them is importing dead code; anything not importing them is dead code itself. No live `audit` proto module is registered in `buf.yaml`.

**Risks:** Compilation passes only because nothing imports them — but a stray import will reintroduce silent staleness.
**Recommended fixes:** Delete both orphan dirs; re-run `buf generate` from a clean state; verify build.
**Priority:** **P1**

---

### 27. Architecture Drift from Approved Rules — PARTIAL

**Evidence:** This audit's structural matrix vs the approved `/services/*` template.

**Findings:**
- `internal/domain` missing in 14 implemented services.
- `internal/eventbus` missing in 17 implemented services.
- `internal/consumer` missing in 17 implemented services.
- `event-gateway` uses `internal/gateway` (silent exception).
- `analytics-service` has no `proto/` or `migrations/` (silent exception).
- `identity-graph-service` is a persistence service with no `store/` or `migrations/` (clear drift).
- 5 services exist without `.proto` (community/moderation/notification/payment/search) and are not in `buf.yaml` (drift between repo and proto governance).

**Risks:** Multi-agent parallel work compounds drift weekly.
**Recommended fixes:** Either backfill missing layers (preferred) or formally ratify each exception in `docs/ARCHITECTURE.md`. Sync `buf.yaml` with reality.
**Priority:** **P1**

---

### 28. MVP Readiness — FAIL

**Evidence:** Aggregate of §11, §12, §13, §18, §21.

**Findings:**
- The video watch flow has no delivery half.
- Session refresh is not implemented.
- Only 2 services are containerizable today.
- Test coverage is far below the constitution's bar.
- Most services emit no events into the mesh they're supposed to feed.

**Verdict:** **MVP NOT READY.** A minimum viable cut requires, in order: (1) playback-service + signed manifests; (2) thumbnail + subtitle minimum; (3) session refresh; (4) eventbus producers in media pipeline; (5) Dockerfiles + K8s app manifests for the implemented services; (6) test backfill on domain/store layers.

**Priority:** **P0**

---

## 4. Top 20 Risks

| # | Risk | Sec | Severity |
|---|---|---|---|
| 1 | Video watch flow has no delivery half — `playback`, `cdn-routing`, `thumbnail`, `subtitle`, `video-segmentation` are scaffold-only. | §12 | **P0** |
| 2 | Committed Windows binary `services/auth-service/server.exe` — security + hygiene. | §23 | **P0** |
| 3 | Orphan generated packages `gen/go/audit/`, `gen/go/payment/` — stale proto/gen drift. | §4, §26 | **P1** |
| 4 | `identity-graph-service` has no `store/` and no `migrations/` despite being a persistence service. | §2, §6 | **P1** |
| 5 | Event mesh has only 2 producers — media/recommendation/feed/trust emit nothing. | §9 | **P1** |
| 6 | `SessionService.Refresh` returns `Unimplemented`. | §11, §25 | **P1** |
| 7 | Test coverage near-zero (14 Go test files across 19 implemented services). | §21 | **P1** |
| 8 | Only 2 of 19 implemented services have a `Dockerfile`. | §18 | **P1** |
| 9 | Only 1 K8s `application.yaml` (auth-service); rest are undeployable. | §18 | **P1** |
| 10 | `internal/domain` missing in 14 implemented services — drift accelerates with parallel agents. | §2, §27 | **P1** |
| 11 | `internal/eventbus` missing in 17 of 19 services. | §2, §9 | **P1** |
| 12 | 5 services missing `.proto` and absent from `buf.yaml` (community/moderation/notification/payment/search). | §4 | **P1** |
| 13 | No contract-drift CI job — frontend/backend type alignment unverified. | §15 | **P1** |
| 14 | `event-gateway` + `analytics-service` exceptions to template are undocumented. | §2, §27 | **P1** |
| 15 | DLQ topics declared but no replay/management tooling visible. | §13 | **P1** |
| 16 | `.gitignore` does not exclude build binaries (`*.exe`, per-service `server`). | §23 | **P1** |
| 17 | Build / lint / typecheck baseline unverified (`turbo run`, `go build`, `buf build`). | §22 | **P2** |
| 18 | Many TS shared packages are 1-file stubs — divergent ad-hoc reimplementation risk. | §16 | **P2** |
| 19 | ClickHouse partitioning + retention undocumented. | §10 | **P2** |
| 20 | Two empty frontend apps (`live-control-room`, `studio-media-console`) — Composer's domain. | §14 | **P2** |

---

## 5. Top 20 Recommended Fixes

Each fix preserves Go-only backend, the `/services/*` layout, and existing contracts.

| # | Fix | Owner agent | Priority |
|---|---|---|---|
| 1 | Delete `services/auth-service/server.exe`; add `*.exe`, `bin/`, `dist/`, per-service `server` to `.gitignore`; add a CI guard rejecting binaries. | Claude (hygiene) | **P0** |
| 2 | Implement `playback-service`: `cmd/server` + `internal/{api,domain,store}` + `migrations/001_init.{up,down}.sql`. Wire to existing `playback.proto`. | Codex | **P0** |
| 3 | Implement `thumbnail-service` and `subtitle-service` minimums (Go service + proto + migrations). | Codex | **P0** |
| 4 | Add `internal/eventbus` to `media-service` and `media-processing-orchestrator`; emit `media.events.v1` per `topics.yaml`. | Codex | **P1** |
| 5 | Regenerate `gen/go` cleanly (`buf generate`); delete `gen/go/audit/` and `gen/go/payment/`. | Claude | **P1** |
| 6 | Add `internal/store` + `migrations/001_init.*.sql` to `identity-graph-service`. | Codex | **P1** |
| 7 | Implement `SessionService.Refresh` (Phase-3 OIDC). | Codex | **P1** |
| 8 | Add per-service Dockerfile derived from `_template/Dockerfile` for the 17 missing services. | Copilot (file-level acceleration) | **P1** |
| 9 | Add K8s `application.yaml` per service modeled on `infrastructure/kubernetes/apps/auth-service`. | Claude | **P1** |
| 10 | Backfill Go unit tests on `internal/domain` and `internal/store` of all implemented services. | Copilot (test generation) | **P1** |
| 11 | Reconcile `buf.yaml`: either add `.proto` for community/moderation/notification/payment/search or remove them from proto governance until contracts are defined. | Claude | **P1** |
| 12 | Add `internal/domain` placeholder packages in the 14 services that lack them; move logic out of `internal/api`. | Codex | **P1** |
| 13 | Add a CI job that fails when committed codegen differs from fresh `buf generate` output. | Claude (CI) | **P1** |
| 14 | Document `event-gateway` and `analytics-service` template exceptions in `docs/ARCHITECTURE.md`. | Claude | **P1** |
| 15 | Add DLQ replay tooling alongside `event-gateway` (separate CLI or service-internal subcommand). | Codex | **P1** |
| 16 | Add `Refresh` + OIDC contract tests once §7 lands. | Copilot | **P2** |
| 17 | Run baseline `turbo run build/lint/typecheck`, `task go:test`, `buf build` and record results in `docs/audits/baseline.md`. | Claude | **P2** |
| 18 | Mark each stub TS package with `// TODO(owner)` and a one-line contract note. | Composer | **P2** |
| 19 | Add ClickHouse retention/TTL `002_*.sql` migration. | Codex | **P2** |
| 20 | Backfill two empty frontend apps (`live-control-room`, `studio-media-console`) with at least an empty React shell + route placeholder. | Composer | **P2** |

---

## 6. MVP Readiness Verdict

**NOT READY.**

Blocking the MVP today, in priority order:

1. **No video can be watched** — the delivery half of the pipeline is absent.
2. **Session refresh is unimplemented** — real user sessions cannot survive token expiry.
3. **17 of 19 services have no Dockerfile and no K8s manifest** — only auth-service is realistically deployable.
4. **Test coverage is far below the constitution's bar** — refactors at four-agent parallelism are unsafe.
5. **Event mesh is largely unwired at producers** — downstream consumers receive no real signal.

Once items 1–3 of the "Top 20 Recommended Fixes" are complete, an internal alpha is plausible. Production MVP requires items 4–10 in addition.

---

## 7. Confidence Level

**Confidence: HIGH on structure, MEDIUM on dynamic behavior.**

- **HIGH** for static analysis: directory layout, file presence, `buf.yaml`, `topics.yaml`, `go.work`, CI workflows, observed stubs.
- **MEDIUM** for runtime behavior: nothing was built, linted, typechecked, or executed in this audit (read-only mandate + slow filesystem). The "UNKNOWN" rows in the checklist reflect this.
- **HIGH** correlation with the cross-referenced Claude audit `IMPLEMENTATION_STATUS.md` — independent observations converge.

---

## 8. Questions / Assumptions

**Assumptions made:**

- The audit was conducted against the current working tree (includes untracked/uncommitted changes per Claude's prior note).
- `Unimplemented*Server` embeds outside of `session_service.go:107` are intentional gRPC forward-compat scaffolding, not regressions.
- `event-gateway` (no `proto/`) and `analytics-service` (no `proto/`, no `migrations/`) are intentional template exceptions, not omissions.
- The `gen/go/buf` directory is descriptor output, not an orphan.
- Rust components under `services/{live,media,recommendation}-service/{ingest,transcoder,ranker}` are intentional polyglot integrations sanctioned by `Cargo.toml` at root, not architecture drift.

**Open questions for the architects (Claude / Codex):**

1. Is `event-gateway`'s `internal/gateway` layout an approved exception, or should it normalize to `internal/api`?
2. Should `analytics-service` formally adopt an empty `proto/` and `migrations/` (with a README pointing to the ClickHouse path), or stay as a documented exception?
3. Is the `gen/go/audit/` package intended for a future `audit-service`, or should it be deleted now?
4. What is the canonical decision on `community/moderation/notification/payment/search` proto contracts — designed but unwritten, or deferred to a later phase?
5. Is the four-agent branch model expected to integrate to `develop` weekly, or per phase? (This affects how aggressively drift should be addressed.)
6. Should Copilot be cleared to backfill Dockerfiles + unit tests across services as bulk acceleration work, or does that require explicit per-service approval?

---

*End of audit. No product code modified.*
