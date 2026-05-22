# NEXT — Independent Repository Audit (AUDIT_CLAUDE)

**Agent:** Claude (architecture / long-context integrator)
**Date:** 2026-05-20
**Branch:** `agent/claude-architecture`
**Mode:** Inspection only — no code modified, no features added, nothing fixed.
**Method:** Direct file inspection, structural enumeration, `git` state, and a sample Go build
(`services/auth-service` → `go build ./...` exit 0, toolchain `go1.26.0`). The full polyglot
workspace build, lint, and typecheck were **not** executed (see §22).

---

## 1. Executive Summary

NEXT is a polyglot monorepo (Go services, Rust media/ranking workers, Python AI, TypeScript apps).
The **platform skeleton is mature and coherent** — monorepo tooling, CI/CD, observability config, and
the Kafka topic catalog are all real and well-built. **Implementation depth is the problem.**

Of **39 backend service directories**, **19 are functional** (runnable gRPC/HTTP service with
`cmd/server` + store) and **20 are scaffold-only** (`go.mod` + README [+ proto], no entrypoint). The
identity domain is the most complete; the **video delivery pipeline is half-built** (ingest, state
machine, and orchestration exist; playback, CDN, thumbnails, subtitles, segmentation do not — a video
cannot be watched end-to-end). The event mesh is fully *specified* but barely *wired* (2 producers,
1 consumer). **Test coverage is near-zero** (13 Go test files across the whole backend).

One concrete defect: a **23.8 MB compiled `server.exe` is committed** to `services/auth-service/`
even though `.gitignore` already excludes `*.exe`. Generated protobuf code (`gen/go`) has drifted
from source.

**MVP verdict: NOT READY.** The backend has a credible identity core but no end-to-end video path,
no meaningful test safety net, and the event/analytics plane is unwired. See §28.

**Confidence: High** for structural findings (file-level evidence); **Medium** for build/runtime
health (only one service build was executed); **Low** for performance (no profiling possible).

---

## 2. Full Checklist Table

| # | Section | Status | Priority |
|---|---|---|---|
| 1 | Monorepo structure | PASS | P3 |
| 2 | Backend service structure | PARTIAL | P1 |
| 3 | Go-only backend compliance | PARTIAL | P2 |
| 4 | Protobuf definitions | PARTIAL | P1 |
| 5 | gRPC APIs | PARTIAL | P1 |
| 6 | Database migrations | PARTIAL | P2 |
| 7 | Postgres usage | PASS | P3 |
| 8 | Redis usage | PARTIAL | P2 |
| 9 | Kafka / event usage | PARTIAL | P1 |
| 10 | ClickHouse / analytics usage | PARTIAL | P2 |
| 11 | Authentication & authorization | PARTIAL | P1 |
| 12 | User/project/video domain model | PARTIAL | P0 |
| 13 | Queue / job lifecycle | PARTIAL | P1 |
| 14 | Frontend apps | PARTIAL | P2 |
| 15 | Frontend/backend contract alignment | PARTIAL | P1 |
| 16 | Shared packages | PARTIAL | P2 |
| 17 | Environment / config handling | PASS | P3 |
| 18 | Docker / dev environment | PARTIAL | P2 |
| 19 | CI/CD | PASS | P3 |
| 20 | Observability / logging / tracing / metrics | PASS | P2 |
| 21 | Testing coverage | FAIL | P0 |
| 22 | Build / lint / typecheck status | UNKNOWN | P1 |
| 23 | Security risks | PARTIAL | P1 |
| 24 | Performance risks | UNKNOWN | P2 |
| 25 | Incomplete TODOs / stubs / placeholders | PARTIAL | P2 |
| 26 | Broken imports / dead code | PASS | P3 |
| 27 | Architecture drift from approved rules | PARTIAL | P1 |
| 28 | MVP readiness | FAIL | P0 |

---

## 3. Detailed Findings by Section

### 1. Monorepo structure — PASS
**Evidence:** `go.work`, `Cargo.toml`, `pyproject.toml`, `pnpm-workspace.yaml`, `turbo.json`,
`Taskfile.yml`, `buf.yaml`, `buf.gen.yaml`; `apps/` (11), `packages/` (78), `services/` (39 + `_template`),
`ai/` (21 subsystems), `infrastructure/`, `gen/go`.
**Findings:** Polyglot orchestration is clean. `Taskfile.yml` unifies TS/Go/Rust/Python; `go.work`
enumerates 4 shared modules + 41 service modules; CI path-filters per language.
**Risks:** None material.
**Recommended fixes:** None.
**Priority:** P3.

### 2. Backend service structure — PARTIAL
**Evidence:** `services/_template/`, all 39 service dirs; `cmd/server/main.go` present in 19.
**Findings:** Approved layout is `cmd/server`, `internal/{api,domain,store,eventbus,consumer}`,
`proto/<domain>/v<N>`, `migrations/NNN_*.{up,down}.sql`. Applied inconsistently:
- `internal/eventbus` exists in **only 2** services (auth, profile); `internal/consumer` in **only 2**
  (analytics, profile).
- `internal/domain` absent from all 7 identity-cluster services — logic sits in `internal/api`.
- `event-gateway` uses `internal/gateway` (not `internal/api`) and has no `proto/`.
- `analytics-service` has no `proto/` and no `migrations/`.
**Risks:** With 4 agents building in parallel, missing `domain`/`eventbus`/`consumer` folders mean new
event/domain code has no agreed home → drift compounds.
**Recommended fixes:** Ratify documented exceptions (event-gateway, analytics-service); add the
missing `internal/*` package folders to functional services as empty placeholders.
**Priority:** P1.

### 3. Go-only backend compliance — PARTIAL
**Evidence:** No Node/TS backend services exist anywhere under `services/`. However Rust components
are embedded inside service dirs: `services/live-service/ingest/` (Rust, the *only* code in that
service), `services/media-service/transcoder/`, `services/recommendation-service/ranker/`.
**Findings:** The "no Node/TS backend" rule is **fully respected**. The "backend service logic must be
Go only" rule is **partially violated in spirit**: `live-service` has *no Go at all* — it is a Rust
service in a Go-shaped directory.
**Risks:** Ambiguity over whether Rust workers are sanctioned; `live-service` cannot satisfy the
`/services/*` Go layout.
**Recommended fixes:** Decide explicitly: either (a) sanction Rust *workers* alongside a Go
coordinator per service, or (b) relocate Rust workers out of `/services`. Give `live-service` a Go
`cmd/server` coordinator or move its ingest worker.
**Priority:** P2.

### 4. Protobuf definitions — PARTIAL
**Evidence:** 30 `.proto` files under `services/*/proto/*/v1/`; `buf.yaml` lists ~30 modules;
`gen/go/` has 32 domain dirs + `buf/validate`.
**Findings:** `gen/go/audit/` and `gen/go/payment/` are **orphaned** — no `audit-service` exists and
`payment-service` has no `.proto`. `community/moderation/notification/search-service` have no proto
and are absent from `buf.yaml`. `gen/go` is committed and stale relative to source.
**Risks:** CI `buf-breaking` check runs against drifted generated code; compilation surprises.
**Recommended fixes:** Run a clean `buf generate`; delete orphan `gen/go` packages; reconcile
`buf.yaml` with services that have no contract.
**Priority:** P1.

### 5. gRPC APIs — PARTIAL
**Evidence:** 30 proto files each define a `service` with RPCs (e.g. `AuthService`, `FeedService`,
`OrchestratorService`, `PlaybackService`). 19 services have generated servers wired in
`internal/api`; `api-gateway` exposes GraphQL via gqlgen.
**Findings:** Contracts are broad and well-shaped. Only 19 of ~30 gRPC contracts have a running
implementation; the other ~11 are proto-only. `auth-service` `SessionService.Refresh` returns
`codes.Unimplemented`.
**Risks:** Callers may target gRPC services that have no server.
**Recommended fixes:** Track which proto contracts are "live" vs "planned"; implement `Refresh`.
**Priority:** P1.

### 6. Database migrations — PARTIAL
**Evidence:** `services/*/migrations/001_init.{up,down}.sql` — 15 services, 30 files; naming matches
`NNN_*.{up,down}.sql`. `infrastructure/clickhouse/migrations/001_event_analytics.sql`.
**Findings:** Convention is followed. Every service is at migration 001 only (expected this early).
`identity-graph-service` has **no migrations** despite being a persistence service.
**Risks:** No schema-evolution discipline exercised yet; identity-graph has no durable store.
**Recommended fixes:** Add `001_init` for identity-graph; confirm a migration runner is wired into
service boot or deploy.
**Priority:** P2.

### 7. Postgres usage — PASS
**Evidence:** `packages/go/database/database.go`; `pgxpool` imported in service mains; 15 services
ship `internal/store/postgres.go`; `docker-compose.yml` postgres on host port 5433.
**Findings:** Consistent — shared `packages/go/database` helper, `pgx/v5` pool, per-service store.
**Risks:** None material; review connection-pool sizing before load.
**Recommended fixes:** None now.
**Priority:** P3.

### 8. Redis usage — PARTIAL
**Evidence:** `services/auth-service/internal/store/redis.go`; `REDIS_URL` in `config/.env.example`;
redis in `docker-compose.yml` (port 6380). `grep` shows Redis referenced only in `auth-service` and
`packages/go/database`.
**Findings:** Redis is provisioned platform-wide but used by **only one service** (auth — session
storage). `session-service` notably does not use Redis.
**Risks:** Unclear caching/session strategy; `session-service` may be re-implementing in Postgres
what auth does in Redis.
**Recommended fixes:** Document the intended Redis ownership; confirm session-service storage choice.
**Priority:** P2.

### 9. Kafka / event usage — PARTIAL
**Evidence:** `infrastructure/kafka/topics.yaml` (11 topic families + 4 DLQs + `analytics-service-v1`
consumer group); `event-gateway` (HTTP→Kafka ingress with HMAC, idempotency, ratelimit);
`analytics-service/internal/consumer`; `packages/go/eventbus`; producers in `auth-service` and
`profile-service` only.
**Findings:** The event plane is **fully specified but barely wired**. Only `auth` and `profile`
produce; only `analytics` consumes. Media, recommendation, feed, trust, creator domains own topic
families but emit nothing.
**Risks:** `topics.yaml` is aspirational; analytics/recommendation have no real event data;
event-driven flows (saga, notifications) cannot function.
**Recommended fixes:** Wire `internal/eventbus` into media-service and orchestrator first (closest to
the critical path); then social/trust domains.
**Priority:** P1.

### 10. ClickHouse / analytics usage — PARTIAL
**Evidence:** `analytics-service/internal/clickhouse/writer.go` (+ test); `infrastructure/clickhouse/
migrations/001_event_analytics.sql`; clickhouse in `docker-compose.yml`; Grafana event-bus dashboard.
**Findings:** `analytics-service` is a functional Kafka→ClickHouse consumer with a query API
(`/internal/v1/query/{table}`). It is real but starved of input (see §9).
**Risks:** Analytics correctness unverifiable until upstream services emit events.
**Recommended fixes:** None to analytics itself; unblock by wiring producers.
**Priority:** P2.

### 11. Authentication & authorization — PARTIAL
**Evidence:** `auth-service` (`UserService`, `SessionService`, `KeyService`/JWKS, Postgres + Redis,
event producer); `session-service`, `access-control-service` (`AuthzService` + `internal/scopes/
catalog.go`), `account-recovery-service`, `device-graph-service`, `notification-auth-service`;
`api-gateway/internal/authz/middleware.go`; `packages/go/auth`; JWT config in `.env.example`.
**Findings:** The identity stack is the most complete domain. Gaps: `SessionService.Refresh` returns
`Unimplemented` ("Phase 3 with OIDC"); authz logic in `access-control-service` is thin (no
`internal/domain`); no end-to-end JWT verification test outside the two integration tests.
**Risks:** Sessions cannot be refreshed; authz enforcement depth unverified.
**Recommended fixes:** Implement `Refresh`; add authz unit/integration tests; verify gateway JWT path.
**Priority:** P1.

### 12. User / project / video generation domain model — PARTIAL
**Evidence:** `media-service/internal/domain/state.go` — state machine
`UPLOADING→UPLOADED→INGESTED→PROCESSING→READY→PUBLISHED|FAILED` with a transition table;
`upload-service` (blob), `media-processing-orchestrator/internal/saga`, `transcoding-service/internal/
ladder`; `playback-service` proto only.
**Findings:** The *upstream* model is solid (clear lifecycle, saga orchestration). The *downstream*
half is **missing**: `playback-service`, `cdn-routing-service`, `thumbnail-service`,
`subtitle-service`, `video-segmentation-service` are all scaffolds. A user-uploaded video has no path
to being watched.
**Risks:** **The core product loop does not close.** This is the single largest MVP blocker.
**Recommended fixes:** Implement `playback-service` against its existing proto; then thumbnails and
CDN routing.
**Priority:** P0.

### 13. Queue / job lifecycle — PARTIAL
**Evidence:** `media-processing-orchestrator/internal/saga/saga.go`, `orchestrator.proto`
(`StartRun`, `GetRun`, `ReportStage`); `transcoding-service/internal/ladder`.
**Findings:** A saga-style orchestration contract exists with run/stage tracking. There is **no
durable job queue, no worker pool, and no retry/DLQ wiring** in the processing path — orchestration
is RPC-driven only; stage workers (transcoding/thumbnail/subtitle) are not running services.
**Risks:** No async durability; a crash mid-run loses progress; no backpressure.
**Recommended fixes:** Define how stages are dispatched (Kafka topic vs. direct RPC) and confirm
orchestrator persistence covers crash recovery.
**Priority:** P1.

### 14. Frontend apps — PARTIAL
**Evidence:** `apps/` — web (181 ts/tsx), studio (47), admin (17), auth-portal (6), account-center
(6), mobile (5, RN), tv (4), immersive (4), **live-control-room (0)**, **studio-media-console (0)**.
**Findings:** `web` is substantial; most apps are thin scaffolds; two apps are **empty** (only
`package.json`). Heavy uncommitted churn across `apps/` from parallel agents (per `git status`).
**Risks:** Empty apps in the workspace break `turbo` graph assumptions; churn risks merge loss.
**Recommended fixes:** Either populate or remove `live-control-room` and `studio-media-console`;
integrate outstanding agent work.
**Priority:** P2.

### 15. Frontend/backend contract alignment — PARTIAL
**Evidence:** `services/api-gateway/schema/schema.graphqls`, `packages/api-client/src/{graphql,grpc,
index}.ts`, `gen/go` (Go-only proto output — `buf.gen.yaml` notes TS/Python codegen is disabled).
**Findings:** The GraphQL surface covers **only identity + profile** ("Phase 4 minimum"). `buf.gen.yaml`
explicitly emits **Go only** — there is **no generated TS/Python client** from proto, so frontend
apps cannot consume gRPC contracts type-safely. `api-client` has a hand-written `grpc.ts`.
**Risks:** Frontend/backend contracts drift silently; no compile-time guarantee the web app matches
service protos.
**Recommended fixes:** Re-enable TS proto codegen in `buf.gen.yaml` when frontends start consuming;
expand the GraphQL schema as subgraphs land.
**Priority:** P1.

### 16. Shared packages — PARTIAL
**Evidence:** `packages/go/{auth,database,eventbus,telemetry}` (real, wired); 78 TS packages.
**Findings:** Go shared libs are healthy. TS packages vary wildly — substantive (`frontend-utils` 48,
`layout-engine` 30, `ui` 25) vs. 1-file stubs (`feature-flags`, `media-sdk`, `recommendation-sdk`,
`upload-sdk`, `permissions`, `security-utils`, etc.). Claude-owned `packages/{config,types,events}`
all exist and have content.
**Risks:** Stub SDK packages may be imported and silently no-op.
**Recommended fixes:** Mark stub packages clearly (`private` / `0.0.0`) or consolidate.
**Priority:** P2.

### 17. Environment / config handling — PASS
**Evidence:** `config/.env.example` (single source of non-secret defaults); `caarlos0/env/v11` used
in all 19 service `main.go` files; `infrastructure/kubernetes/charts/next-service/templates/
externalsecret.yaml` (External Secrets / Vault).
**Findings:** Consistent, typed env loading; secrets correctly externalized to Vault, not the repo.
**Risks:** None material.
**Recommended fixes:** None.
**Priority:** P3.

### 18. Docker / dev environment — PARTIAL
**Evidence:** `docker-compose.yml` (postgres, redis, kafka, schema-registry, clickhouse, opensearch,
qdrant, otel-collector, jaeger, prometheus, grafana); `.devcontainer/`; service Dockerfiles for
`auth-service`, `profile-service`, and `_template` only.
**Findings:** The local data/observability tier is complete and thoughtful (port offsets documented).
Only **2 of 19** functional services have a Dockerfile.
**Risks:** 17 services cannot be containerized/deployed without filling in Dockerfiles.
**Recommended fixes:** Add per-service Dockerfiles from `_template/Dockerfile`.
**Priority:** P2.

### 19. CI/CD — PASS
**Evidence:** `.github/workflows/` — `ci.yml`, `image-build.yml`, `preview-env.yml`, `release.yml`,
`security.yml`, `terraform-plan.yml`, `terraform-apply.yml`. `ci.yml` uses `dorny/paths-filter` to
gate per-language jobs; Go job runs `go test -race` per service + `golangci-lint`; proto job runs buf
lint + breaking.
**Findings:** Well-architected and polyglot-aware.
**Risks:** CI Go job iterates `services/*` — scaffold services with no tests pass trivially, giving a
false green.
**Recommended fixes:** None blocking; consider a coverage floor.
**Priority:** P3.

### 20. Observability / logging / tracing / metrics — PASS
**Evidence:** `infrastructure/monitoring/` (otel-collector agent/gateway/local, prometheus, grafana
2 dashboards, loki, tempo, alerting rules/slo/event-bus); `packages/go/telemetry`; `otelgrpc`
imported in service mains; `docs/observability.md`.
**Findings:** Strong, consistent instrumentation foundation; structured logging via `log/slog`.
**Risks:** Value is unrealized until more services emit traces/metrics; SLO alerts reference services
that don't exist yet.
**Recommended fixes:** Prune SLO rules to live services.
**Priority:** P2.

### 21. Testing coverage — FAIL
**Evidence:** 13 Go `_test.go` files total: `feed-service/internal/domain` (3),
`recommendation-service/internal/domain` (3), `event-gateway` (3), `analytics-service` (2),
`auth-service` + `profile-service` integration (1 each). `vitest.config.ts` in `apps/web` and
`apps/studio`. `tests/` has Playwright + k6 + event-contract harness (minimal content).
**Findings:** 10 of 19 functional services have **zero** tests; Rust and Python effectively
untested. The cross-cutting e2e/load harness is scaffolded but not substantive.
**Risks:** No regression safety net — fatal for a 4-agent parallel-development model.
**Recommended fixes:** Mandate a test bar (domain unit + 1 store integration test) before any service
is promoted; backfill the 10 untested functional services.
**Priority:** P0.

### 22. Build / lint / typecheck status — UNKNOWN
**Evidence:** `go1.26.0` toolchain present; `services/auth-service` → `go build ./...` exited **0**.
The full Go workspace, `golangci-lint`, `pnpm turbo lint/typecheck`, `cargo`, and `uv` were **not**
run (inspection-only audit; running full builds risks long, environment-dependent operations).
**Findings:** One service builds cleanly. Whole-workspace health is unverified. Note `go.work` targets
`go 1.25.0` while the installed toolchain is `1.26.0` — benign but worth aligning.
**Risks:** Scaffold services, stale `gen/go`, and uncommitted multi-agent churn could break a full
build; status is genuinely unknown.
**Recommended fixes:** Run `task build` / `task lint` / `task test` in a clean env and record results.
**Priority:** P1.

### 23. Security risks — PARTIAL
**Evidence:** `services/auth-service/server.exe` — **23.8 MB committed binary**, tracked despite
`.gitignore` lines 88-90 (`bin/`, `*.exe`, `*.exe~`). `event-gateway/internal/security/auth.go` —
HMAC-SHA256 request signing with replay-skew window (good). No hardcoded secrets found in Go/YAML
(grep clean; secrets via External Secrets/Vault). `infrastructure/kubernetes/base/default-deny.yaml`.
**Findings:** No credential leakage detected; gateway auth design is sound. The committed binary is
the real defect — repo bloat, platform-specific artifact in history, and a possible carrier of
embedded build-time data.
**Risks:** Binary in VCS history; CI green despite ignore-rule bypass; no dependency-vuln scan
evidence beyond `security.yml` (not inspected in depth).
**Recommended fixes:** Remove `server.exe` from tracking (and history if feasible); verify
`security.yml` runs SAST/dependency scanning.
**Priority:** P1.

### 24. Performance risks — UNKNOWN
**Evidence:** `topics.yaml` partition counts (playback 384, recommendation 384); `tests/load/feed.k6.ts`,
`tests/backend/events/event-gateway.load.k6.ts`; HPA/PDB in the Helm chart.
**Findings:** Capacity *intent* is visible (partitioning, autoscaling, load scripts) but **no
profiling or load-test results exist**. Connection-pool sizing, N+1 query risk, and hot-path
allocation are unassessable from source alone.
**Risks:** Unknown — cannot be quantified pre-implementation.
**Recommended fixes:** Run the k6 scripts against a deployed env once the video path closes.
**Priority:** P2.

### 25. Incomplete TODOs / stubs / placeholders — PARTIAL
**Evidence:** 20 scaffold-only services; `auth-service` `Refresh` → `Unimplemented`; `gen/go`
orphans; 2 empty frontend apps; ~15 single-file stub TS packages; `media-service/transcoder` and
`recommendation-service/ranker` Rust workers are stubs; `ai/` is mostly `__init__.py`.
**Findings:** Stubs are *honest* (clearly scaffolded, not fake-complete) — but numerous. No
misleading "panic-if-called" placeholders found in product code beyond generated gqlgen internals.
**Risks:** Volume of scaffolding makes "done" hard to measure; proto drift accumulates on unbuilt
services.
**Recommended fixes:** Maintain a live build-order roadmap; don't let scaffolds drift.
**Priority:** P2.

### 26. Broken imports / dead code — PASS
**Evidence:** `services/auth-service` builds clean (exit 0); no `panic("not implemented")` in
hand-written product code; stub packages compile (single-file `src`).
**Findings:** No broken imports or dead code detected in the sampled build. Full-workspace
verification not done (see §22), so this is PASS-with-caveat.
**Risks:** Low — unverified services could still have issues.
**Recommended fixes:** Confirm with a full `go build ./...`.
**Priority:** P3.

### 27. Architecture drift from approved rules — PARTIAL
**Evidence:** §2 (template gaps), §3 (Rust in `/services`), §4 (`gen/go` drift), `docs/audits/
multi-agent-drift-report.md` and `service-maturity-matrix.md` already track related items (RB-2/RB-3).
**Findings:** Drift is real but **contained and known**: inconsistent `internal/*` package presence,
Rust workers inside Go service dirs, stale generated code, `live-service` with no Go. The
`/services/*` *outer* contract (`cmd/server`, `proto/<domain>/v<N>`, `migrations/NNN_*`) is otherwise
respected by the 19 functional services.
**Risks:** Four agents in parallel will amplify un-ratified drift.
**Recommended fixes:** Convert each drift item into an explicit ADR — sanction or correct it.
**Priority:** P1.

### 28. MVP readiness — FAIL
**Evidence:** Synthesis of §1–§27.
**Findings:** The identity core is credible, but (a) **the video upload→watch loop does not close**
(§12), (b) **test coverage is near-zero** (§21), (c) **the event/analytics plane is unwired** (§9–10),
(d) most services have no Dockerfile or K8s manifest (§18), (e) whole-workspace build health is
unverified (§22). An MVP of a video platform requires at minimum: upload, process, and watch.
**Risks:** Declaring MVP now would ship a platform on which no video can be played.
**Recommended fixes:** Close the video path, backfill tests, wire events — then re-audit.
**Priority:** P0.

---

## 4. Top 20 Risks

| # | Risk | Section | Priority |
|---|---|---|---|
| 1 | Video upload→watch loop does not close (playback/CDN/thumbnail/subtitle are scaffolds). | 12 | P0 |
| 2 | Test coverage near-zero (13 Go test files; 10/19 functional services untested). | 21 | P0 |
| 3 | MVP cannot be declared — core product loop incomplete. | 28 | P0 |
| 4 | Event mesh specified but unwired (2 producers, 1 consumer). | 9 | P1 |
| 5 | Analytics/ClickHouse starved of input — correctness unverifiable. | 10 | P1 |
| 6 | `gen/go` stale — orphan `audit`/`payment` packages; buf-breaking CI unreliable. | 4 | P1 |
| 7 | 23.8 MB `server.exe` committed despite `.gitignore` `*.exe`. | 23 | P1 |
| 8 | Whole-workspace build/lint/typecheck status unknown. | 22 | P1 |
| 9 | `SessionService.Refresh` returns `Unimplemented` — sessions can't refresh. | 11 | P1 |
| 10 | No durable job queue / worker pool in the media processing path. | 13 | P1 |
| 11 | No generated TS/Python proto clients — frontend/backend contracts drift silently. | 15 | P1 |
| 12 | `internal/{domain,eventbus,consumer}` missing from most services — drift home. | 2 | P1 |
| 13 | Architecture drift un-ratified ahead of 4-agent parallel work. | 27 | P1 |
| 14 | 11 of ~30 gRPC contracts have no running server. | 5 | P1 |
| 15 | Only 2 of 19 services have a Dockerfile; only 1 K8s app manifest. | 18 | P2 |
| 16 | Rust workers embedded in `/services`; `live-service` has no Go. | 3 | P2 |
| 17 | `identity-graph-service` has no store/migrations — no durable state. | 6 | P2 |
| 18 | Redis used by only one service; session storage strategy unclear. | 8 | P2 |
| 19 | 2 empty frontend apps + ~15 stub TS packages pollute the workspace graph. | 14,16 | P2 |
| 20 | SLO/alert rules reference services that don't exist. | 20 | P2 |

## 5. Top 20 Recommended Fixes

| # | Fix | Priority |
|---|---|---|
| 1 | Implement `playback-service` (cmd/server + api + store + 001_init) against its proto. | P0 |
| 2 | Backfill Go tests for the 10 untested functional services (domain + store). | P0 |
| 3 | Implement `thumbnail-service` + `cdn-routing-service` to close the watch path. | P0 |
| 4 | Wire `internal/eventbus` into media-service + orchestrator so `media.events.v1` emits. | P1 |
| 5 | Run a clean `buf generate`; delete orphan `gen/go/audit` + `gen/go/payment`. | P1 |
| 6 | Remove `services/auth-service/server.exe` from tracking. | P1 |
| 7 | Run `task build`/`lint`/`test` in a clean env; record whole-workspace status. | P1 |
| 8 | Implement `auth-service` `SessionService.Refresh`. | P1 |
| 9 | Define media-stage dispatch (Kafka vs RPC) + crash-recovery for orchestrator runs. | P1 |
| 10 | Re-enable TS proto codegen in `buf.gen.yaml` for frontend contract safety. | P1 |
| 11 | Reconcile `buf.yaml` with services lacking proto (community/moderation/notification/search). | P1 |
| 12 | Add empty `internal/{domain,eventbus,consumer}` placeholders to functional services. | P1 |
| 13 | Write an ADR per drift item (Rust workers, template exceptions, gen output). | P1 |
| 14 | Add `internal/store` + `001_init` migrations to `identity-graph-service`. | P2 |
| 15 | Add per-service Dockerfiles (from `_template`) + K8s `application.yaml`. | P2 |
| 16 | Give `live-service` a Go coordinator or relocate its Rust ingest worker. | P2 |
| 17 | Document Redis ownership and confirm `session-service` storage choice. | P2 |
| 18 | Populate or remove `live-control-room` + `studio-media-console` apps. | P2 |
| 19 | Mark/consolidate single-file stub TS packages; verify `security.yml` scans deps. | P2 |
| 20 | Prune SLO/alert rules to live services; align `go.work` to the installed toolchain. | P3 |

## 6. MVP Readiness Verdict

**NOT READY.** NEXT has a strong platform skeleton and a credible identity core, but it fails the
minimum bar for a video platform MVP: **a video uploaded today cannot be watched** (playback, CDN,
thumbnail services are unbuilt — §12). Compounding blockers: near-zero test coverage (§21), an
unwired event/analytics plane (§9–10), unverified whole-workspace build health (§22), and missing
deploy artifacts for 17 of 19 services (§18).

**Path to MVP:** close the video path (fixes 1–3), backfill tests (fix 2), wire events (fix 4),
verify the build (fix 7), then re-audit. The identity domain is the closest to production-ready and
can serve as the quality template.

## 7. Confidence Level

- **Structural findings (services, packages, files, layout): High** — every claim is backed by
  direct file/directory inspection.
- **Build/runtime health: Medium** — only `auth-service` was actually compiled; the rest is inferred.
- **Performance: Low** — no profiling or load testing was possible in inspection-only mode.
- **Overall: Medium-High.**

## 8. Questions & Assumptions

**Assumptions:**
1. `<AGENT_NAME>` resolves to `CLAUDE`; this file is `docs/AUDIT_CLAUDE.md`.
2. Rust workers (`transcoder`, `ranker`, `ingest`) are intended to live inside `/services` — treated
   as drift pending an ADR, not a hard violation.
3. Uncommitted working-tree churn (other agents' in-progress work) is excluded from "implemented"
   counts — this audit reflects committed state on `agent/claude-architecture`.
4. `analytics-service` and `event-gateway` are intentional template exceptions (no proto/migrations).

**Questions for the team:**
1. Is the video pipeline expected to dispatch stages via Kafka or direct gRPC? (§13)
2. Are Rust workers sanctioned inside `/services`, or should they relocate? (§3)
3. What is the intended Redis ownership boundary, and why does `session-service` not use it? (§8)
4. Should `gen/go` be committed at all, or generated in CI? (§4)
5. Are `live-control-room` and `studio-media-console` planned apps or abandoned? (§14)
6. Is `payment-service` in scope for MVP (it has a `gen/go` dir but no proto)? (§4)

---
*Inspection-only audit. No product code was modified. Cross-reference: `docs/audits/
service-maturity-matrix.md`, `docs/audits/multi-agent-drift-report.md`.*
