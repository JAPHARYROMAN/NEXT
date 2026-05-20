# NEXT — Implementation Status Audit

**Date:** 2026-05-20
**Auditor:** Claude (architecture agent)
**Branch audited:** `agent/claude-architecture`
**Scope:** Full implementation audit prior to new feature work. No features added, no architecture rewritten.

---

## 1. Executive Summary

NEXT is a large polyglot monorepo (Go backend services, Rust media/ranking components, Python AI
systems, TypeScript apps + packages). The **scaffolding is broad and consistent**, but **implementation
depth is shallow and uneven**. Of 39 backend service directories, **19 have Go code** and **20 are
scaffold-only** (`go.mod` + maybe a `.proto` + `README`). The identity domain is the most complete;
the media/video pipeline is partially wired; discovery, social, monetization, and live are mostly empty.

The approved `/services/*` layout is broadly respected but **inconsistently applied** — most services
omit `internal/domain`, `internal/eventbus`, and `internal/consumer`. Test coverage is sparse (13 Go
test files total). One committed build artifact (`server.exe`) and stale generated code are the only
outright defects found.

---

## 2. Status Table — Done / Partial / Missing / Broken

| Area | Status | Notes |
|---|---|---|
| Monorepo structure (go.work / Cargo / pyproject / pnpm / turbo / Taskfile) | **Done** | Polyglot orchestration is coherent and complete. |
| Backend services — identity cluster | **Partial** | 7 services have `cmd+api+store+migrations+proto`; logic is thin. |
| Backend services — media pipeline | **Partial** | upload/media/orchestrator/transcoding implemented; playback/thumbnail/subtitle are scaffolds. |
| Backend services — discovery/feed/reco | **Partial** | feed + recommendation implemented; ranking/search/discovery/candidate-gen empty. |
| Backend services — social/monetization/live | **Missing** | community, moderation, notification, payment scaffold-only; live has Rust ingest only. |
| Frontend apps | **Partial** | web (181 files) substantial; most apps thin; `live-control-room` + `studio-media-console` empty. |
| Shared packages (TS) | **Partial** | 78 packages; many `*-ui`/`*-sdk` packages are 1-file stubs. |
| Shared packages (Go) | **Done** | `packages/go/{auth,database,eventbus,telemetry}` exist and are wired. |
| Protobuf definitions | **Partial** | 30 `.proto` files; `gen/go` is stale (orphan `audit`/`payment` dirs; 4 services have no proto). |
| Database migrations | **Partial** | 15 services have `001_init` only; identity-graph/analytics/event-gateway have none. |
| Event / Kafka usage | **Partial** | topic catalog complete; only auth+profile produce, only analytics consumes. |
| Authentication | **Partial** | auth/session/access-control wired; session refresh returns `Unimplemented`. |
| Project / video generation flow | **Partial** | ingest→state→orchestration exist; playback/delivery missing. |
| Tests | **Partial** | 13 Go test files; most services have zero tests. e2e/load harness scaffolded. |
| CI/CD | **Done** | 7 workflows, path-filtered, polyglot-aware. |
| Observability | **Done** | otel/prometheus/grafana/loki/tempo configs + alerting rules + dashboards. |
| Docker / dev environment | **Partial** | docker-compose data tier complete; only 2 of 19 services have a Dockerfile. |
| Missing files | **See §15** | Orphan generated code, missing protos, empty apps. |
| Broken / incomplete | **Broken** | `services/auth-service/server.exe` committed; stale `gen/go`. |

---

## 3. Monorepo Structure — Done

Polyglot layout is clean and complete:

- **Go:** `go.work` enumerates 4 shared modules + 41 service modules.
- **Rust:** root `Cargo.toml` workspace; 3 components (`live-service/ingest`, `media-service/transcoder`, `recommendation-service/ranker`).
- **Python:** `pyproject.toml`; `ai/` has 21 model subsystems (mostly `__init__.py` stubs — 21 `.py` files total).
- **TypeScript:** `pnpm-workspace.yaml` + `turbo.json`; `apps/` (11) + `packages/` (78).
- **Orchestration:** `Taskfile.yml` ties all four toolchains together; `buf.yaml`/`buf.gen.yaml` for proto.

No action needed.

---

## 4. Backend Services

**39 service directories** (excluding `_template`). **19 have Go implementations**; **20 are scaffold-only.**

### Implemented (19)

| Service | cmd | api | domain | store | migrations | proto | eventbus | consumer |
|---|---|---|---|---|---|---|---|---|
| auth-service | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| profile-service | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| feed-service | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | — |
| media-service | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | — |
| media-processing-orchestrator | ✓ | ✓ | ✓ (saga) | ✓ | ✓ | ✓ | — | — |
| recommendation-service | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | — |
| transcoding-service | ✓ | ✓ | ✓ (ladder) | ✓ | ✓ | ✓ | — | — |
| upload-service | ✓ | ✓ | ✓ (blob) | ✓ | ✓ | ✓ | — | — |
| access-control-service | ✓ | ✓ | — | ✓ | ✓ | ✓ | — | — |
| account-recovery-service | ✓ | ✓ | — | ✓ | ✓ | ✓ | — | — |
| creator-identity-service | ✓ | ✓ | — | ✓ | ✓ | ✓ | — | — |
| device-graph-service | ✓ | ✓ | — | ✓ | ✓ | ✓ | — | — |
| notification-auth-service | ✓ | ✓ | — | ✓ | ✓ | ✓ | — | — |
| session-service | ✓ | ✓ | — | ✓ | ✓ | ✓ | — | — |
| trust-service | ✓ | ✓ | — | ✓ | ✓ | ✓ | — | — |
| identity-graph-service | ✓ | ✓ | ✓ (graph) | **—** | **—** | ✓ | — | — |
| analytics-service | ✓ | ✓ | — | **—** (clickhouse) | **—** | **—** | — | ✓ |
| event-gateway | ✓ | **—** (gateway) | — | **—** | **—** | **—** | — | — |
| api-gateway | ✓ | — (GraphQL) | — | — | — | — (gqlgen) | — | — |

### Scaffold-only (20)

`candidate-generation-service`, `cdn-routing-service`, `clip-generation-service`, `community-service`,
`discovery-service`, `live-service` (Rust ingest only), `media-analytics-service`,
`media-metadata-service`, `media-search-service`, `moderation-service`, `notification-service`,
`payment-service`, `personalization-service`, `playback-service`, `ranking-service`,
`search-service`, `semantic-retrieval-service`, `subtitle-service`, `thumbnail-service`,
`video-segmentation-service`.

### Structure deviations from the approved `/services/*` layout

The approved layout is `cmd/server`, `internal/{api,domain,store,eventbus,consumer}`,
`proto/<domain>/v<N>`, `migrations/NNN_*.{up,down}.sql`. Observed deviations:

- **`internal/eventbus` exists in only 2 services** (auth, profile); `internal/consumer` in only 2 (analytics, profile). Every event-producing/consuming service should have these.
- **`internal/domain` missing** from all 7 identity-cluster services — business logic lives directly in `internal/api`.
- **`event-gateway`** uses `internal/gateway` instead of `internal/api` and has no `proto/` — defensible for an HTTP ingress, but it diverges from the template silently.
- **`analytics-service`** has no `proto/` and no `migrations/` (writes to ClickHouse) — defensible, but undocumented as an exception.

These are not errors but should be ratified as explicit, documented exceptions or corrected.

---

## 5. Frontend Apps

| App | TS/TSX files | Assessment |
|---|---|---|
| web | 181 | Substantial — routes, features, public/app/social/creator groups. Heavy uncommitted churn. |
| studio | 47 | Moderate — creator console; many untracked new route dirs. |
| admin | 17 | Thin scaffold. |
| auth-portal | 6 | Thin scaffold. |
| account-center | 6 | Thin scaffold. |
| mobile | 5 | React Native scaffold. |
| tv | 4 | Vite scaffold (newly added, untracked). |
| immersive | 4 | Vite scaffold (newly added, untracked). |
| **live-control-room** | **0** | **Empty — `package.json` only.** |
| **studio-media-console** | **0** | **Empty — `package.json` only.** |

---

## 6. Shared Packages

**78 packages.** Go shared libs (`packages/go/{auth,database,eventbus,telemetry}`) are real and wired
into services. TS packages are mostly UI; depth varies widely:

- **Substantive:** `frontend-utils` (48), `layout-engine` (30), `ui` (25), `onboarding-ui` (20), `community-ui` (14), `live-ui` (13).
- **Stub (1-file `src`):** `access-control`, `discovery-utils`, `embedding-utils`, `feature-flags`, `feed-types`, `media-events`, `media-sdk`, `permissions`, `player-controls`, `recommendation-sdk`, `security-utils`, `session-utils`, `streaming-utils`, `trust-events`, `upload-sdk`.

Per the operating model, `packages/{config,types,events}` are Claude-owned — `config`, `types`, and
`events` all exist and have content (`events` = 8 files).

---

## 7. Protobuf Definitions — Partial / stale

- **30 `.proto` files**, one per domain under `services/<svc>/proto/<domain>/v1/`. `buf.yaml` enumerates ~30 modules; `buf.gen.yaml` emits Go only into `gen/go`.
- **`gen/go` is committed and stale:**
  - `gen/go/audit/` and `gen/go/payment/` exist but there is **no audit-service** and `payment-service` has **no `.proto`** → orphaned generated packages.
  - `community-service`, `moderation-service`, `notification-service`, `search-service` have **no `.proto`** and are absent from `buf.yaml`.
- **Risk:** generated code drift. `gen/go` should be regenerated from a clean `buf generate` and the orphans removed.

---

## 8. Database Migrations — Partial

- **15 services** have exactly `migrations/001_init.up.sql` + `001_init.down.sql` (30 files). Naming matches the approved `NNN_*.{up,down}.sql` convention.
- Every service is still at migration **001** — no schema evolution has occurred yet (expected this early).
- **`identity-graph-service` has no migrations** despite being a persistence service → it has no store layer at all (see §4).
- **ClickHouse:** `infrastructure/clickhouse/migrations/001_event_analytics.sql` (single migration) backs analytics-service.

---

## 9. Event / Kafka Usage — Partial

- **`infrastructure/kafka/topics.yaml`** is a complete catalog: 11 topic families (`identity`, `session`, `media`, `playback`, `creator`, `community`, `recommendation`, `search`, `moderation`, `commerce`, `system`) + 4 DLQ topics + the `analytics-service-v1` consumer group.
- **`event-gateway`** is the implemented HTTP→Kafka ingress (idempotency, ratelimit, security, envelope).
- **`analytics-service`** is the implemented consumer (ClickHouse sink).
- **Producers exist in only 2 services:** `auth-service` and `profile-service` (`internal/eventbus`).
- **Gap:** media, recommendation, feed, trust, creator-identity etc. emit no events despite owning topic families. The event mesh is defined but largely unwired.

---

## 10. Authentication — Partial

- `auth-service` — `UserService` + `SessionService`, token issuer, Postgres + Redis store, event producer.
  - **`SessionService.Refresh` returns `codes.Unimplemented`** ("refresh implemented in Phase 3 with OIDC code path") — a known, deliberate gap.
- `session-service`, `access-control-service` (authz catalog + scopes), `account-recovery-service`, `device-graph-service`, `notification-auth-service` — implemented at api+store depth, logic thin.
- `api-gateway` has `internal/authz/middleware.go`.
- `packages/go/auth` is the shared verification lib.

Auth is the most complete domain but not production-complete (refresh path, OIDC).

---

## 11. Project / Video Generation Flow — Partial

Intended pipeline: **upload → media (state machine) → orchestrator (saga) → transcoding → playback/delivery.**

| Stage | Service | Status |
|---|---|---|
| Upload (blob, resumable) | upload-service | Implemented (api + disk blob + store) |
| Media lifecycle state machine | media-service | Implemented — `UPLOADING→UPLOADED→INGESTED→PROCESSING→READY→PUBLISHED/FAILED` |
| Processing orchestration | media-processing-orchestrator | Implemented — saga coordinator |
| Transcoding ladder | transcoding-service | Implemented (api + ladder); Rust `transcoder` is a stub |
| Thumbnails | thumbnail-service | **Scaffold only** |
| Subtitles | subtitle-service | **Scaffold only** |
| Segmentation | video-segmentation-service | **Scaffold only** |
| Playback / manifest signing | playback-service | **Scaffold only** (proto exists, no Go) |
| CDN routing | cdn-routing-service | **Scaffold only** |

**Conclusion:** ingest, state, and orchestration exist; **the entire delivery half (playback, CDN,
thumbnails, subtitles, segmentation) is unimplemented.** A video cannot currently be watched end-to-end.

---

## 12. Tests — Partial

- **Go: 13 test files total.** Coverage concentrated in `feed-service/internal/domain` (3),
  `recommendation-service/internal/domain` (3), `event-gateway` (3), `analytics-service` (2), plus
  `auth-service` and `profile-service` integration tests. **All other ~17 implemented services have zero tests.**
- **Frontend:** `vitest.config.ts` in `apps/web` and `apps/studio` (studio's is untracked).
- **Cross-cutting harness:** `tests/e2e/playwright.config.ts`, `tests/load/feed.k6.ts`,
  `tests/backend/events/{event-contracts.test.ts, event-gateway.load.k6.ts}` — harness scaffolded, content minimal.
- **Rust/Python:** effectively no tests.

---

## 13. CI/CD — Done

`.github/workflows/`: `ci.yml`, `image-build.yml`, `preview-env.yml`, `release.yml`, `security.yml`,
`terraform-plan.yml`, `terraform-apply.yml`.

`ci.yml` is well-built: `dorny/paths-filter` gates per-language jobs (ts / go / rust / python / proto /
terraform / kubernetes); Go job runs `go test -race` per service dir + `golangci-lint`; proto job runs
buf lint + breaking-change check. No action needed.

---

## 14. Observability — Done

- `infrastructure/monitoring/`: otel-collector (`agent`, `gateway`, `local`), Prometheus, Grafana
  (2 dashboards: golden-signals + event-bus), Loki, Tempo, and alerting (`rules`, `slo`, `event-bus-rules`).
- `docker-compose.yml` boots otel-collector + Jaeger + Prometheus + Grafana locally.
- `packages/go/telemetry` is the shared instrumentation lib; `docs/observability.md` documents it.

Coverage is strong. Gap: instrumentation only matters once more services emit traces/metrics.

---

## 15. Missing Files & 16. Broken / Incomplete

### Broken / defects

- **`services/auth-service/server.exe`** — a compiled Windows binary is committed to the repo. Must be removed and added to `.gitignore`.
- **`gen/go/audit/` and `gen/go/payment/`** — orphaned generated packages with no source `.proto`. Stale; regenerate `gen/go` cleanly.

### Missing

- **Protos:** `community-service`, `moderation-service`, `notification-service`, `payment-service`, `search-service` have no `.proto` and are absent from `buf.yaml`.
- **Persistence:** `identity-graph-service` has `internal/api` + `internal/graph` but no `internal/store` and no `migrations/`.
- **Empty apps:** `apps/live-control-room` and `apps/studio-media-console` have `package.json` but zero source files.
- **Dockerfiles:** only `auth-service` and `profile-service` have one; the other 17 implemented services rely solely on `_template/Dockerfile`.
- **K8s manifests:** `infrastructure/kubernetes/apps/` contains only `auth-service` — no other service has an ArgoCD `application.yaml`.

### Exact files / directories needing attention

```
services/auth-service/server.exe                      # DELETE — committed binary
gen/go/audit/                                         # DELETE — orphan generated pkg
gen/go/payment/                                       # DELETE — orphan generated pkg
services/identity-graph-service/internal/store/       # MISSING — add store layer
services/identity-graph-service/migrations/           # MISSING — add 001_init
services/{community,moderation,notification,payment,search}-service/proto/   # MISSING — add proto + register in buf.yaml
apps/live-control-room/src/                           # EMPTY app
apps/studio-media-console/src/                        # EMPTY app
services/playback-service/                            # SCAFFOLD — blocks video watch flow
.gitignore                                            # ADD *.exe / server binaries
buf.yaml                                              # OUT OF SYNC with services that have no proto
```

---

## 17. Risks & Blockers

| # | Risk / Blocker | Severity | Impact |
|---|---|---|---|
| R1 | Video watch flow incomplete — playback/CDN/thumbnail/subtitle are scaffolds. | **High** | No end-to-end video experience is possible. |
| R2 | `gen/go` is stale (orphan `audit`/`payment`); proto↔gen drift. | **High** | Compilation/codegen surprises; CI buf-breaking checks unreliable. |
| R3 | Committed `server.exe` binary. | Medium | Repo bloat; platform-specific artifact in VCS; possible secret-in-binary risk. |
| R4 | Event mesh defined but unwired — only 2 producers, 1 consumer. | Medium | Analytics/recommendation/feed lack real event data; topic catalog is aspirational. |
| R5 | Test coverage near-zero outside 4 services. | Medium | Refactors and parallel-agent merges are unguarded against regressions. |
| R6 | `/services/*` template applied inconsistently (`domain`/`eventbus`/`consumer` often absent). | Medium | Future event/domain work has no home; drift compounds with 4 parallel agents. |
| R7 | Heavy uncommitted working-tree churn across `apps/` and `packages/` from other agents. | Medium | Audit is a snapshot; merge conflicts and lost work likely if not integrated soon. |
| R8 | Auth `SessionService.Refresh` returns `Unimplemented`. | Low | Sessions cannot be refreshed — known Phase 3 gap. |
| R9 | Only 2 service Dockerfiles; only 1 K8s app manifest. | Low | Cannot deploy most services without filling these in. |

---

## 18. Next 10 Recommended Implementation Tasks

Ordered by unblocking value. Each respects the constraints: **Go-only backend logic, no new product
features, no architecture rewrite, preserve the `/services/*` structure.**

1. **Remove `services/auth-service/server.exe`** and add `*.exe` / build-output ignores to `.gitignore`. (Trivial, immediate hygiene.)
2. **Regenerate `gen/go` cleanly** via `buf generate` and delete orphan `gen/go/audit` and `gen/go/payment`. Verify the workspace still builds.
3. **Reconcile `buf.yaml`** — either add `.proto` files for `community/moderation/notification/payment/search` services or remove them from proto governance until they have contracts.
4. **Implement `playback-service`** (`cmd/server` + `internal/api` + `internal/store` + `migrations/001_init`) against its existing `playback.proto` — unblocks the video watch flow.
5. **Add `internal/store` + `migrations/001_init` to `identity-graph-service`** so it is a real persistence service rather than an in-memory graph.
6. **Wire event production into the media pipeline** — add `internal/eventbus` to `media-service` and `media-processing-orchestrator` so `media.events.v1` is actually emitted.
7. **Implement `transcoding-service` → `thumbnail-service` + `subtitle-service`** as the next delivery-pipeline stages (Go services + proto + migrations).
8. **Backfill Go unit tests** for the implemented-but-untested services (identity cluster, media-service, upload-service, orchestrator) — target `internal/domain` and `internal/store` first.
9. **Ratify and document `/services/*` template exceptions** (event-gateway, analytics-service) and add empty `internal/domain` placeholders where business logic currently lives in `internal/api`.
10. **Add per-service Dockerfiles and K8s `application.yaml`** for the 19 implemented services using `_template/Dockerfile` and `infrastructure/kubernetes/apps/auth-service` as the pattern.

---

## 19. Constraints Honored

- No new product features introduced.
- No architecture rewritten.
- No Node/TS backend services proposed — all backend tasks above are Go-only.
- The approved `/services/*` structure (`cmd/server`, `internal/{api,domain,store,eventbus,consumer}`,
  `proto/<domain>/v<N>`, `migrations/NNN_*.{up,down}.sql`) is preserved and used as the yardstick.
