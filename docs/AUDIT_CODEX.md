# NEXT Repository Audit - Codex

- Agent: Codex GPT-5.5
- Date: 2026-05-20
- Scope: root checkout at `C:\projects\Actual Projects\next`
- Exclusions: nested branch sandboxes under `.worktrees/**` and `.claude/worktrees/**`
- Mode: inspection only. No product code or feature files were changed.
- Governing rules: NEXT Master Build Constitution v1.0, ADRs, Go-only backend rule, canonical `/services/*` layout rule.

## Executive Summary

NEXT has a broad, serious monorepo foundation: 10 apps, 77 package directories, 39 backend service directories, Terraform/Kubernetes/Docker infrastructure, Kafka and ClickHouse definitions, ADRs, standards, runbooks, and security/governance documentation. The repository direction matches the NEXT Constitution at the architectural intent level: modular, event-driven, observable, polyglot by approved runtime, and human-centered.

The implementation is not MVP-ready. The dominant blockers are integration and verification failures, scaffold-heavy backend surface area, frontend/backend contract gaps, and layout drift from the approved service structure.

Key facts from this audit:

- `services`: 39 service directories excluding `_template`.
- Runnable Go services with `cmd/server/main.go`: 19.
- Services without an entrypoint: 20.
- Service `.proto` files: 30.
- Service Go test files: 13 total.
- TypeScript/JavaScript backend service logic outside `clients/typescript`: 0 files found.
- Root TypeScript build, test, and typecheck fail at `@next/events` codegen because `buf.gen.yaml` is not found from `packages/events`.
- `pnpm lint` fails because `eslint` is not available in the local `.bin` path.
- `buf lint` fails on event proto `go_package` conflicts and validation lint errors.
- Module-by-module Go tests expose a real build failure in `packages/go/eventbus`.
- Rust workspace test fails because selected dependencies require newer Rust than the installed `rustc 1.85.1`.
- Python test command creates an environment successfully but finds no tests.
- Terraform formatting/parse check fails in `infrastructure/terraform/modules/opensearch/variables.tf`.

MVP readiness verdict: **FAIL - not ready for a usable end-to-end MVP**. NEXT is best described as a large architecture and platform foundation with some functional identity, media, feed, recommendation, event, and analytics slices, but no verified end-to-end product path.

## Full Checklist Table

| # | Area | Status | Priority | Short Finding |
|---:|---|---|---|---|
| 1 | Monorepo structure | PARTIAL | P1 | Strong structure, but dirty/untracked integration state and worktree complexity remain. |
| 2 | Backend service structure | FAIL | P1 | Only a minority match the exact required layout; 20 services have no entrypoint. |
| 3 | Go-only backend compliance | PASS | P2 | No TS/JS backend service logic found under `/services` outside TS clients. |
| 4 | Protobuf definitions | PARTIAL | P1 | Many protos exist, but `buf lint` fails and several services have no proto. |
| 5 | gRPC APIs | PARTIAL | P1 | Functional services expose gRPC, but many contracts are unimplemented scaffolds. |
| 6 | Database migrations | PARTIAL | P1 | Several services have up/down migrations; many services have none. |
| 7 | Postgres usage | PARTIAL | P2 | pgx patterns exist, but not uniformly and not all service stores are implemented. |
| 8 | Redis usage | PARTIAL | P2 | Redis wrappers and infra exist; service use is uneven or documented-only. |
| 9 | Kafka/event usage | PARTIAL | P1 | Event infra exists; DLQ/replay and producer adoption are incomplete. |
| 10 | ClickHouse/analytics usage | PARTIAL | P2 | ClickHouse schema and analytics service exist, but integration is not fully verified. |
| 11 | Authentication and authorization | PARTIAL | P1 | Auth foundations exist, but gateway behavior and tests leave security gaps. |
| 12 | User/project/video generation domain model | PARTIAL | P1 | User/media models exist; generation/project domains are scaffold or absent. |
| 13 | Queue/job lifecycle | FAIL | P1 | No complete job lifecycle/outbox/replay implementation was found. |
| 14 | Frontend apps | PARTIAL | P1 | Broad app surface exists, but many routes use demo/mock/placeholder data. |
| 15 | Frontend/backend contract alignment | FAIL | P0 | Web/studio surfaces exceed live gateway contracts. |
| 16 | Shared packages | PARTIAL | P1 | Many useful packages exist, but codegen/typecheck/lint paths are broken. |
| 17 | Environment/config handling | PARTIAL | P2 | Env parsing exists, but validation and deployment coverage are inconsistent. |
| 18 | Docker/dev environment | PARTIAL | P1 | Compose/devcontainer exist, but toolchain and infra checks fail. |
| 19 | CI/CD | PARTIAL | P1 | Workflows exist, but local equivalent checks fail. |
| 20 | Observability/logging/tracing/metrics | PARTIAL | P2 | OTel/Prometheus patterns exist, not universal and not fully verified. |
| 21 | Testing coverage | FAIL | P1 | Backend test coverage is thin; Python has no tests; TS tests cannot run. |
| 22 | Build/lint/typecheck status | FAIL | P0 | Go, TS, buf, Rust, and Terraform checks fail. |
| 23 | Security risks | PARTIAL | P1 | Strong docs, but implementation gaps include permissive gateway auth and raw IP logging. |
| 24 | Performance risks | PARTIAL | P2 | Scalability plans exist, but unverified services and fallback paths create risk. |
| 25 | Incomplete TODOs/stubs/placeholders | FAIL | P1 | 20 service scaffolds plus many frontend placeholders and AI stubs. |
| 26 | Broken imports or dead code | FAIL | P1 | `packages/go/eventbus`, `@next/events` codegen, proto lint, and Terraform parsing fail. |
| 27 | Architecture drift from approved rules | FAIL | P1 | Canonical service layout is not consistently preserved. |
| 28 | MVP readiness | FAIL | P0 | No verified end-to-end watch/feed/search/community/notification path. |

## Detailed Findings

### 1. Monorepo Structure

- Status: PARTIAL
- Priority: P1
- Evidence:
  - `package.json`
  - `pnpm-workspace.yaml`
  - `turbo.json`
  - `go.work`
  - `Cargo.toml`
  - `pyproject.toml`
  - `apps/`
  - `services/`
  - `packages/`
  - `ai/`
  - `infrastructure/`
  - `docs/`
- Findings:
  - The repo is organized as a mature polyglot monorepo with TS apps/packages, Go services/packages, Rust packages, Python AI workspaces, infra, docs, and CI.
  - `pnpm-workspace.yaml` includes `apps/*`, `packages/*`, `services/*/clients/typescript`, and `tooling/*`.
  - `go.work` lists service and Go package modules plus `gen/go`.
  - The root checkout is dirty with substantial untracked frontend/docs/package changes. This reduces audit confidence for "current stable state".
  - Nested worktrees exist under `.worktrees` and `.claude/worktrees`; they are branch sandboxes, not root product code.
- Risks:
  - The root state is hard to reason about because completed phase work and frontend work are not fully integrated into a clean branch.
  - Monorepo commands fail before exercising all packages.
- Recommended fixes:
  - Establish a clean `develop` integration branch and merge phases through PRs.
  - Keep `.worktrees/**` ignored and outside product scans.
  - Add a root health command that verifies all runtimes without changing generated artifacts.

### 2. Backend Service Structure

- Status: FAIL
- Priority: P1
- Evidence:
  - `services/*`
  - `docs/adr/0038-canonical-go-service-layout.md`
  - `docs/standards/go-service-standards.md`
  - Service scan: 39 services, 19 with `cmd/server/main.go`, 20 without entrypoint.
  - Exact required directories checked: `cmd/server`, `internal/api`, `internal/domain`, `internal/store`, `internal/eventbus`, `internal/consumer`, `proto/<domain>/v<N>`, `migrations`.
- Findings:
  - The required service structure is not consistently preserved.
  - Many services use older or alternate layouts such as `internal/kafka`, `internal/config`, `internal/metrics`, or service-specific packages.
  - `profile-service` is the only inspected service that matched every exact required directory in the scan.
  - `event-gateway`, `analytics-service`, and `api-gateway` are functional but do not preserve the exact requested layout.
  - `community-service`, `live-service`, `notification-service`, `payment-service`, `search-service`, and multiple media/discovery services are scaffold-only.
- Risks:
  - Agent work will continue to drift if service layout exceptions are not resolved.
  - Future phases may duplicate systems instead of extending canonical modules.
- Recommended fixes:
  - Normalize all functional services to ADR 0038 or explicitly document approved exceptions.
  - Update `_template` to generate the exact approved layout.
  - Add a CI layout check for `/services/*`.

### 3. Go-Only Backend Compliance

- Status: PASS
- Priority: P2
- Evidence:
  - `services/*`
  - Service scan found `TSJSOutsideClients = 0`.
  - `docs/adr/0007-backend-languages.md`
- Findings:
  - No TypeScript/JavaScript backend service logic was found under `services/*` outside allowed TS client areas.
  - Backend service implementations are Go where implemented.
  - Node/TypeScript appears limited to frontend apps, packages, tooling, and client/codegen surfaces.
- Risks:
  - `packages/database` is a TS database wrapper package, which is acceptable for TS tools/apps but should not become backend service logic.
- Recommended fixes:
  - Keep CI enforcement for "no TS/JS service runtime under `/services` except clients".
  - Prefer `packages/go/*` for backend shared runtime packages.

### 4. Protobuf Definitions

- Status: PARTIAL
- Priority: P1
- Evidence:
  - `services/*/proto/**/*.proto`
  - `packages/events/schemas/**/*.proto`
  - `gen/go/**/*.pb.go`
  - `buf.yaml`
  - `buf.gen.yaml`
  - `buf lint` output.
- Findings:
  - 30 service proto files exist.
  - Event protos exist under `packages/events/schemas`.
  - Generated Go files exist under `gen/go`.
  - `buf lint` fails:
    - `packages/events/schemas/auth/v1/session_started.proto`
    - `packages/events/schemas/auth/v1/user_registered.proto`
    - conflicting `go_package` values in package `next.events.auth.v1`.
    - `processing_stage.proto` and `video_published.proto` use equal min/max string length instead of `len`.
  - `packages/events/package.json` runs `buf generate` from `packages/events`, where `buf.gen.yaml` is not present.
- Risks:
  - Proto contracts cannot be trusted as a stable source of truth while lint/codegen fail.
  - Generated clients can drift from hand-authored schemas.
- Recommended fixes:
  - Fix event proto `go_package` conflicts.
  - Use root-scoped `buf generate` or provide package-local buf config.
  - Add CI that fails on proto lint and generated-code drift.

### 5. gRPC APIs

- Status: PARTIAL
- Priority: P1
- Evidence:
  - `services/auth-service/proto/auth/v1/auth.proto`
  - `services/profile-service/proto/profile/v1/profile.proto`
  - `services/recommendation-service/proto/recommendation/v1/recommendation.proto`
  - `services/feed-service/proto/feed/v1/feed.proto`
  - `gen/go/**`
  - `services/api-gateway/cmd/server/main.go`
- Findings:
  - Several functional services register gRPC servers and use generated clients.
  - `api-gateway` currently translates GraphQL to gRPC for auth/profile only.
  - Many proto contracts belong to services with no Go packages, no server, no store, and no tests.
- Risks:
  - Consumers may assume service APIs exist because proto files exist.
  - Federation and frontend contracts are ahead of actual backends.
- Recommended fixes:
  - Classify each proto as implemented, planned, or deprecated.
  - Generate and publish client SDKs only for implemented service APIs.
  - Add gRPC smoke tests for every runnable service.

### 6. Database Migrations

- Status: PARTIAL
- Priority: P1
- Evidence:
  - `services/*/migrations/*.up.sql`
  - `services/*/migrations/*.down.sql`
  - `infrastructure/clickhouse/migrations/001_event_analytics.sql`
- Findings:
  - Migration pairs exist for several functional services, including auth, profile, session, media, feed, recommendation, trust, upload, and transcoding.
  - Many services have no migrations because they are scaffold-only.
  - ClickHouse has `001_event_analytics.sql` but no paired down migration in the inspected path.
- Risks:
  - Database lifecycle is uneven across services.
  - Rollback story is incomplete for ClickHouse analytics schema.
- Recommended fixes:
  - Require up/down migration pairs for all service-owned Postgres schema.
  - Add migration validation to CI.
  - Add ClickHouse rollback or rebuild documentation tied to event replay.

### 7. Postgres Usage

- Status: PARTIAL
- Priority: P2
- Evidence:
  - `packages/go/database/database.go`
  - `services/*/internal/store/postgres.go`
  - `services/*/cmd/server/main.go`
  - `docs/adr/0017-database-per-service.md`
- Findings:
  - Functional services consistently use `pgx`/`pgxpool` patterns.
  - `packages/go/database` provides shared Postgres helpers.
  - Services parse `POSTGRES_URL` via `caarlos0/env` or inline config.
  - Scaffold services do not yet implement repositories.
- Risks:
  - Some services duplicate connection setup instead of using shared database helpers.
  - Store integration tests are sparse.
- Recommended fixes:
  - Standardize on `packages/go/database` for Go services.
  - Add repository integration tests using a local Postgres test URL.
  - Document per-service DB ownership in a generated service catalog.

### 8. Redis Usage

- Status: PARTIAL
- Priority: P2
- Evidence:
  - `packages/go/database/database.go`
  - `packages/database/src/redis.ts`
  - `docker-compose.yml`
  - `infrastructure/terraform/modules/elasticache-redis`
  - Service READMEs for auth, feed, profile, session, search, community, notification.
- Findings:
  - Redis infrastructure and shared wrappers exist.
  - `auth-service` uses `REDIS_URL`.
  - Many Redis uses are documented but not implemented because dependent services are scaffolds.
- Risks:
  - Cache, rate limit, presence, and dedupe behavior may be assumed by docs but not actually available.
  - Redis outage behavior is not uniformly tested.
- Recommended fixes:
  - Track implemented Redis use per service.
  - Add Redis degradation tests for auth, feed, notification, and presence once implemented.
  - Standardize key naming and TTL enforcement in Go helpers.

### 9. Kafka/Event Usage

- Status: PARTIAL
- Priority: P1
- Evidence:
  - `infrastructure/kafka/topics.yaml`
  - `packages/events/src/contracts/envelope.ts`
  - `packages/events/src/topics.ts`
  - `packages/go/eventbus/eventbus.go`
  - `services/event-gateway`
  - `services/analytics-service`
  - `docs/events/*`
  - `tests/backend/events/event-contracts.test.ts`
- Findings:
  - Category topics exist for identity, session, media, playback, creator, community, recommendation, search, moderation, commerce, and system.
  - Event envelope schemas and fixtures exist.
  - Event gateway and analytics service exist.
  - DLQ coverage in `topics.yaml` is partial: identity, media, playback, and shared analytics DLQ cover the rest.
  - `scripts/kafka-replay` is referenced in docs and topic config but is missing.
  - `packages/go/eventbus` fails to build against the current `kafka-go` API.
- Risks:
  - Event producers in Go services cannot safely standardize on the broken Go eventbus package.
  - Replay and DLQ operations are documented but not executable.
- Recommended fixes:
  - Fix `packages/go/eventbus` build.
  - Add category-specific DLQs or document a supported shared-DLQ triage model.
  - Implement `scripts/kafka-replay` or remove references.

### 10. ClickHouse/Analytics Usage

- Status: PARTIAL
- Priority: P2
- Evidence:
  - `infrastructure/clickhouse/migrations/001_event_analytics.sql`
  - `services/analytics-service`
  - `docs/events/clickhouse-analytics.md`
  - `infrastructure/monitoring/grafana/dashboards/event-bus-analytics.json`
  - `infrastructure/monitoring/alerting/event-bus-rules.yaml`
- Findings:
  - ClickHouse raw and derived analytics tables are defined.
  - Analytics service has ClickHouse code and two test files.
  - Monitoring dashboard and alerting files reference ClickHouse insert latency and write failures.
  - Full end-to-end Kafka to ClickHouse verification was not demonstrated.
- Risks:
  - Analytics may appear production-ready while replay, DLQ, schema lint, and eventbus build are unresolved.
- Recommended fixes:
  - Add an integration test that publishes sample events and verifies ClickHouse rows.
  - Add migration apply/rollback validation.
  - Align ClickHouse event table columns with canonical event envelope exactly.

### 11. Authentication and Authorization

- Status: PARTIAL
- Priority: P1
- Evidence:
  - `services/auth-service`
  - `services/session-service`
  - `services/access-control-service`
  - `services/api-gateway/internal/authz/middleware.go`
  - `services/api-gateway/router.yaml`
  - `docs/security/*`
  - `docs/adr/0012-authentication.md`
  - `docs/adr/0022-access-control-rego.md`
- Findings:
  - Auth-service implements JWT/JWKS foundations and session-related contracts.
  - Security docs define OIDC, RS256 JWT, JWKS, mTLS, SPIFFE/SPIRE, and Rego authorization.
  - API gateway middleware treats invalid JWTs as anonymous and leaves rejection to resolvers.
  - `services/api-gateway/internal/authz/middleware.go` logs `remote_ip`, which conflicts with the privacy-safe posture.
  - Gateway auth paths have no dedicated tests in the observed Go test run.
- Risks:
  - Invalid-token requests can reach resolvers unless every resolver enforces identity correctly.
  - Raw remote IP logging is a privacy and compliance risk.
  - Authz policy behavior may be documented more deeply than implemented.
- Recommended fixes:
  - Reject invalid bearer tokens at gateway by default; allow anonymous only when no token is sent.
  - Remove raw IP logging or hash/truncate it at ingress.
  - Add regression tests for JWT valid, invalid, expired, anonymous, and RBAC paths.

### 12. User/Project/Video Generation Domain Model

- Status: PARTIAL
- Priority: P1
- Evidence:
  - `services/auth-service`
  - `services/profile-service`
  - `services/media-service`
  - `services/upload-service`
  - `services/transcoding-service`
  - `services/candidate-generation-service`
  - `services/clip-generation-service`
  - `services/video-segmentation-service`
  - `ai/video-intelligence`
  - `ai/highlight-detection`
- Findings:
  - User identity and profile domains have functional services.
  - Media upload, media records, transcoding, and orchestration have functional slices.
  - Video generation, clip generation, candidate generation, and segmentation are contract or scaffold-heavy.
  - No robust "project" domain model was found as a first-class backend service.
- Risks:
  - Product surfaces can imply creator projects or generated clips without backend support.
  - AI/video-generation contracts may drift while implementation is absent.
- Recommended fixes:
  - Define whether "project" belongs to studio, media, or creator domain.
  - Implement generation services only after stable media metadata and playback foundations exist.
  - Mark scaffold-only generation APIs as not production-supported.

### 13. Queue/Job Lifecycle

- Status: FAIL
- Priority: P1
- Evidence:
  - `infrastructure/kafka/topics.yaml`
  - `services/media-processing-orchestrator`
  - `docs/events/replay-and-dlq.md`
  - Missing `scripts/kafka-replay`
- Findings:
  - Kafka topics and orchestration docs exist.
  - Media orchestrator has saga-like code, but this is not a universal queue/job lifecycle system.
  - No complete outbox, retry, DLQ redrive, job state table, lease, or replay implementation was found.
- Risks:
  - Long-running media, AI, notification, and analytics jobs cannot be operated reliably.
  - Operators cannot re-drive failed event streams despite docs claiming replay.
- Recommended fixes:
  - Define one canonical job lifecycle: accepted, leased, running, retrying, failed, DLQ, completed.
  - Implement event outbox and idempotency in services that publish business events.
  - Build and test the replay/redrive tool.

### 14. Frontend Apps

- Status: PARTIAL
- Priority: P1
- Evidence:
  - `apps/web`
  - `apps/studio`
  - `apps/admin`
  - `apps/auth-portal`
  - `apps/account-center`
  - `apps/mobile`
  - `apps/tv`
  - `apps/immersive`
  - `apps/live-control-room`
  - `apps/studio-media-console`
- Findings:
  - The frontend surface is broad and product-rich.
  - Apps have package manifests and framework configs.
  - Many surfaces use demo/mock/placeholder data:
    - `apps/web/src/lib/demo-*.ts`
    - `apps/studio/src/features/analytics/analytics-shell.tsx`
    - `apps/studio/src/features/upload/upload-flow.tsx`
    - `apps/admin/src/app/moderation/page.tsx`
  - TypeScript build/test/typecheck currently fail before app-level verification completes.
- Risks:
  - Experience demos can be mistaken for backend-integrated MVP features.
  - Frontend routes may compile only after resolving shared package/codegen issues.
- Recommended fixes:
  - Publish an app-route to backend-contract matrix.
  - Feature-flag demo-only routes.
  - Convert demo modules to `@next/api-client` queries once gateway contracts exist.

### 15. Frontend/Backend Contract Alignment

- Status: FAIL
- Priority: P0
- Evidence:
  - `services/api-gateway/schema/schema.graphqls`
  - `services/api-gateway/cmd/server/main.go`
  - `apps/web/src/lib/demo-*.ts`
  - `packages/api-client/src/grpc.ts`
  - `packages/api-client/codegen.ts`
- Findings:
  - API gateway GraphQL schema is explicitly "Phase 4 minimum: identity + profile".
  - Gateway only wires auth/profile gRPC clients.
  - Web, studio, live, community, monetization, search, watch-party, TV, and immersive experiences exceed available backend contracts.
  - `packages/api-client/src/grpc.ts` is a stub comment pointing to generated stubs.
- Risks:
  - The main product cannot move from demo data to real data without contract expansion.
  - Client codegen is blocked by codegen configuration failures.
- Recommended fixes:
  - Define MVP contract set: auth, profile, feed, media, playback, upload.
  - Extend gateway only for implemented services.
  - Make frontend routes fail closed or show unavailable state when contracts are absent.

### 16. Shared Packages

- Status: PARTIAL
- Priority: P1
- Evidence:
  - `packages/`
  - `packages/events`
  - `packages/go/eventbus`
  - `packages/go/database`
  - `packages/go/telemetry`
  - `packages/api-client`
  - `packages/config`
  - `packages/design-system`
- Findings:
  - There are 77 package directories and 74 package.json packages.
  - Shared Go packages exist for auth, database, eventbus, and telemetry.
  - Shared TS packages cover UI, design, events, database wrappers, SDKs, telemetry, feature flags, and utilities.
  - Shared package verification is broken:
    - `@next/events` codegen fails.
    - `@next/config` typecheck runs `tsc --noEmit` without a root `tsconfig.json` in the package.
    - `packages/go/eventbus` fails to build.
- Risks:
  - Shared packages amplify breakage across every app/service.
- Recommended fixes:
  - Fix shared package verification before feature work.
  - Require every shared package to own a local `tsconfig.json` or opt out of typecheck.
  - Add package maturity labels: production, experimental, placeholder.

### 17. Environment/Config Handling

- Status: PARTIAL
- Priority: P2
- Evidence:
  - `services/*/cmd/server/main.go`
  - `services/analytics-service/internal/config/config.go`
  - `services/event-gateway/internal/config/config.go`
  - `packages/telemetry/src/node.ts`
  - `apps/auth-portal/src/lib/gateway.ts`
  - `apps/account-center/src/lib/gateway.ts`
  - `docker-compose.yml`
  - `infrastructure/kubernetes/apps/auth-service/values-prod.yaml`
- Findings:
  - Go services use env structs and required fields for core URLs.
  - Frontend apps use `NEXT_PUBLIC_*` and app-specific env vars.
  - Only `auth-service` has an inspected production values file under Kubernetes apps.
  - There is no uniform config validation inventory for all services/apps.
- Risks:
  - Services may run locally but fail in deployed environments due missing values.
  - Placeholder production URLs can leak into manifests.
- Recommended fixes:
  - Generate a config manifest per service.
  - Add startup config validation tests.
  - Keep examples separate from production values.

### 18. Docker/Dev Environment

- Status: PARTIAL
- Priority: P1
- Evidence:
  - `docker-compose.yml`
  - `.devcontainer/devcontainer.json`
  - `.mise.toml`
  - `Taskfile.yml`
- Findings:
  - Local data and observability stack includes Postgres, Redis, Kafka, Schema Registry, ClickHouse, OpenSearch, Qdrant, OTel Collector, Jaeger, Prometheus, and Grafana.
  - Devcontainer installs mise and runs `pnpm install --frozen-lockfile`.
  - Taskfile has convenient cross-runtime tasks.
  - Some Taskfile Go commands are incompatible with workspace/module behavior (`go build ./services/...`, `go test ./services/...`).
  - Terraform check fails, TS commands fail, and Rust toolchain is behind dependency requirements.
- Risks:
  - New contributors cannot rely on `task bootstrap`, `task build`, or CI-equivalent local flow.
- Recommended fixes:
  - Update Taskfile Go commands to iterate modules like CI.
  - Pin Rust toolchain compatible with dependencies or pin dependencies compatible with Rust 1.85.1.
  - Add a one-command smoke test after bootstrap.

### 19. CI/CD

- Status: PARTIAL
- Priority: P1
- Evidence:
  - `.github/workflows/ci.yml`
  - `.github/workflows/security.yml`
  - `.github/workflows/image-build.yml`
  - `.github/workflows/preview-env.yml`
  - `.github/workflows/release.yml`
  - `.github/workflows/terraform-plan.yml`
  - `.github/workflows/terraform-apply.yml`
- Findings:
  - CI is well-structured by changed paths for TS, Go, Rust, Python, proto, Terraform, and Kubernetes.
  - Security workflow includes CodeQL, dependency review, Semgrep, Trivy, and Gitleaks.
  - Local equivalents of key checks fail, so CI would likely fail on this root state.
  - Go CI loops `services/*`, so `packages/go/eventbus` failure may be missed unless package paths change.
- Risks:
  - CI can miss broken shared Go packages.
  - Main/develop integration can be blocked by existing build failures.
- Recommended fixes:
  - Include `packages/go/**` and `gen/go` in Go test loop.
  - Run `buf lint` before TS codegen.
  - Add a required "root verification" workflow that mirrors local audit commands.

### 20. Observability/Logging/Tracing/Metrics

- Status: PARTIAL
- Priority: P2
- Evidence:
  - `packages/go/telemetry/telemetry.go`
  - `packages/telemetry`
  - `docs/observability.md`
  - `docs/standards/observability-standards.md`
  - `infrastructure/monitoring`
  - `services/*/cmd/server/main.go`
- Findings:
  - OTel and Prometheus patterns are documented and partially implemented.
  - Docker compose includes OTel Collector, Jaeger, Prometheus, and Grafana.
  - Event bus analytics dashboard and alert rules exist.
  - Scaffold services have no telemetry because they have no implementation.
  - Raw IP logging appears in gateway JWT failure path.
- Risks:
  - Observability coverage looks stronger in docs than in runtime reality.
  - Privacy-sensitive log fields could enter structured logs.
- Recommended fixes:
  - Add telemetry checklist to service layout CI.
  - Remove raw PII from logs.
  - Add metrics smoke tests for runnable services.

### 21. Testing Coverage

- Status: FAIL
- Priority: P1
- Evidence:
  - Service scan: 13 Go test files under `services`.
  - TS scan: 68 test/spec files under `apps`, `packages`, and `tests`.
  - `tests/backend/events/event-contracts.test.ts`
  - `tests/backend/events/event-gateway.load.k6.ts`
  - `tests/e2e/playwright.config.ts`
  - `pnpm test` failure.
  - `uv run pytest ai/ packages/python/ -q` result: no tests ran.
- Findings:
  - Functional services have very thin Go test coverage.
  - Root TS tests cannot run because `@next/events` codegen fails first.
  - Python AI workspace has no tests.
  - Load and e2e harnesses exist but are not proof of passing product flows.
- Risks:
  - Regressions in auth, gateway, eventbus, and data stores are likely.
- Recommended fixes:
  - Require unit and store integration tests before service promotion.
  - Fix codegen so TS tests execute.
  - Add minimal Python tests for each AI component.

### 22. Build/Lint/Typecheck Status

- Status: FAIL
- Priority: P0
- Evidence:
  - `go test ./...` from root fails because root is a workspace, not a module.
  - Module-by-module Go tests fail in `packages/go/eventbus`.
  - `pnpm typecheck` fails at `@next/events#codegen` and `@next/config#typecheck`.
  - `pnpm lint` fails because `eslint` is not recognized locally.
  - `pnpm test` fails at `@next/events#codegen`.
  - `pnpm build` fails at `@next/events#codegen`.
  - `buf lint` fails.
  - `cargo test --workspace --no-fail-fast` fails due Rust version mismatch.
  - `uv run pytest ai/ packages/python/ -q` finds no tests.
  - `terraform fmt -check -recursive infrastructure/terraform` fails parsing OpenSearch variables.
- Findings:
  - The repo is not currently green for any full-root verification path.
- Risks:
  - Any MVP claim would be unverifiable.
  - CI will likely block integration once these paths are exercised.
- Recommended fixes:
  - Treat green root verification as the next integration milestone.
  - Fix shared package/codegen/proto/infra blockers before adding features.

### 23. Security Risks

- Status: PARTIAL
- Priority: P1
- Evidence:
  - `docs/security/*`
  - `docs/standards/security-standards.md`
  - `.github/workflows/security.yml`
  - `services/api-gateway/internal/authz/middleware.go`
  - `services/auth-service/internal/tokens/issuer.go`
  - `services/auth-service/migrations/001_init.up.sql`
- Findings:
  - Security documentation is strong and covers zero trust, auth, service identity, event security, AI security, incident response, and supply chain.
  - Security CI exists.
  - Implementation gaps remain:
    - Invalid JWT continues as anonymous in gateway.
    - Raw remote IP is logged on JWT verification failure.
    - Auth/gateway/access-control tests are insufficient.
    - Some docs describe systems beyond current implementation.
- Risks:
  - Auth bypass bugs can hide in resolver-level checks.
  - Sensitive telemetry/logging can violate privacy requirements.
- Recommended fixes:
  - Enforce invalid-token rejection at gateway.
  - Add security tests for gateway/auth/access-control.
  - Add static checks for raw IP, token, and secret logging.

### 24. Performance Risks

- Status: PARTIAL
- Priority: P2
- Evidence:
  - `docs/scaling-strategy.md`
  - `docs/resilience/*`
  - `infrastructure/terraform`
  - `infrastructure/kafka/topics.yaml`
  - `docker-compose.yml`
  - `services/api-gateway/cmd/server/main.go`
- Findings:
  - Performance/scaling strategy is documented.
  - Kafka partitions and retention are defined.
  - CDN, multi-region, and edge strategies are documented.
  - Actual performance cannot be validated while build/test paths fail and major services are unimplemented.
  - API gateway currently has limited upstreams and no verified rate limiter/circuit breaker implementation in the Go gateway.
- Risks:
  - Scalability claims may outpace implementation.
  - Load tests can exercise scaffolds or mocks instead of real service paths.
- Recommended fixes:
  - Add per-service baseline load tests only after service is implemented.
  - Verify gateway rate limiting, timeouts, retries, and degradation with integration tests.
  - Add performance budgets to CI for core MVP paths.

### 25. Incomplete TODOs/Stubs/Placeholders

- Status: FAIL
- Priority: P1
- Evidence:
  - 20 services without `cmd/server/main.go`.
  - `apps/web/src/lib/demo-*.ts`
  - `apps/studio/src/features/analytics/analytics-shell.tsx`
  - `packages/commerce-ui/src/checkout-placeholder.tsx`
  - `packages/broadcast-ui/src/ingest-placeholders.tsx`
  - `packages/api-client/src/grpc.ts`
  - `ai/*`
  - `IMPLEMENTATION_STATUS.md`
  - `docs/audits/service-maturity-matrix.md`
- Findings:
  - Placeholders are widespread and often intentional, but they are not isolated behind a production readiness gate.
  - AI components have small file counts and appear mostly scaffold-level.
  - Numerous UI packages expose placeholder components.
- Risks:
  - Stakeholders can mistake designed/demo surfaces for implemented backend capabilities.
- Recommended fixes:
  - Add `experimental` or `demo-only` metadata to packages/routes.
  - Maintain a generated scaffold inventory.
  - Block production builds from importing demo data modules.

### 26. Broken Imports or Dead Code

- Status: FAIL
- Priority: P1
- Evidence:
  - `packages/go/eventbus/eventbus.go`
  - `packages/events/package.json`
  - `packages/config/package.json`
  - `packages/events/schemas/auth/v1/*.proto`
  - `infrastructure/terraform/modules/opensearch/variables.tf`
- Findings:
  - `packages/go/eventbus` does not compile because `kafka.Transport.Dial` expects a `net.Conn` return shape, but current wrapper returns `kafka.Conn`.
  - `@next/events` codegen is broken by missing local `buf.gen.yaml`.
  - `@next/config` typecheck invokes TypeScript without a local package tsconfig.
  - Terraform OpenSearch variables use invalid single-line block syntax with multiple arguments.
  - Proto lint fails.
- Risks:
  - Broken shared primitives can cascade into many services.
- Recommended fixes:
  - Fix eventbus against the installed `kafka-go` version.
  - Move codegen to root or give `packages/events` a valid buf config.
  - Add local `tsconfig.json` or remove typecheck from config-only package.
  - Fix Terraform block syntax.

### 27. Architecture Drift From Approved Rules

- Status: FAIL
- Priority: P1
- Evidence:
  - User rule: preserve `/services/*` structure.
  - `docs/adr/0038-canonical-go-service-layout.md`
  - Service layout scan.
  - `docs/audits/runtime-boundary-audit.md`
  - `docs/audits/multi-agent-drift-report.md`
- Findings:
  - Go-only backend compliance is strong.
  - Service structure compliance is weak.
  - Event topology has drift between category streams, legacy topic maps, partial DLQs, and missing replay implementation.
  - API gateway implementation is a Go gqlgen gateway while docs also reference Apollo Router config, creating dual gateway framing.
- Risks:
  - Multi-agent work will continue to diverge without enforced templates and checks.
- Recommended fixes:
  - Make ADR 0038 mechanically enforceable.
  - Decide and document exact gateway runtime split: Go gqlgen, Apollo Router, or hybrid.
  - Retire obsolete topic maps and align all event docs/code to ADR 0036/0039.

### 28. MVP Readiness

- Status: FAIL
- Priority: P0
- Evidence:
  - Failed verification commands listed in section 22.
  - 20 services without entrypoints.
  - Frontend demo-data usage.
  - Gateway identity/profile-only schema.
  - Missing playback/search/community/notification implementations in root.
- Findings:
  - NEXT is not ready for a user-facing MVP.
  - The repo is ready for an integration stabilization phase.
  - The likely MVP spine should be: auth, profile, upload/media, playback, feed, event ingest, analytics, web shell.
- Risks:
  - Continuing feature phases before stabilization will increase drift and make root integration harder.
- Recommended fixes:
  - Freeze new surface-area phases until root build/lint/test/proto/infra checks are green.
  - Implement only the MVP spine before broadening service count.
  - Replace demo data on one route at a time with live contracts.

## Top 20 Risks

| Rank | Risk | Priority | Evidence |
|---:|---|---|---|
| 1 | Root build/test/typecheck/lint are failing. | P0 | `pnpm build`, `pnpm test`, `pnpm typecheck`, `pnpm lint` |
| 2 | Frontend surfaces are ahead of backend contracts. | P0 | `apps/web/src/lib/demo-*.ts`, `services/api-gateway/schema/schema.graphqls` |
| 3 | 20 backend services have no runnable entrypoint. | P1 | `/services/*` scan |
| 4 | Canonical service layout is not enforced. | P1 | ADR 0038 vs service scan |
| 5 | `packages/go/eventbus` fails to build. | P1 | module Go test output |
| 6 | Proto lint fails. | P1 | `buf lint` output |
| 7 | `@next/events` codegen fails from package context. | P1 | `packages/events/package.json` |
| 8 | Gateway invalid JWT handling is permissive. | P1 | `services/api-gateway/internal/authz/middleware.go` |
| 9 | Raw remote IP can be logged on auth failure. | P1 | `services/api-gateway/internal/authz/middleware.go` |
| 10 | Test coverage is too thin for production promotion. | P1 | 13 service Go test files |
| 11 | Replay tool is referenced but missing. | P1 | `infrastructure/kafka/topics.yaml`, missing `scripts/kafka-replay` |
| 12 | DLQ ownership is partial/shared. | P2 | `infrastructure/kafka/topics.yaml` |
| 13 | Terraform parsing/format check fails. | P1 | `infrastructure/terraform/modules/opensearch/variables.tf` |
| 14 | Rust workspace cannot build with installed rustc. | P2 | `cargo test` output |
| 15 | Python AI workspace has no tests. | P2 | `uv run pytest` output |
| 16 | CI Go loop may miss shared Go packages. | P1 | `.github/workflows/ci.yml` |
| 17 | Config/deployment coverage is uneven across services. | P2 | only auth prod values observed |
| 18 | Placeholder UI packages can leak into production. | P2 | `packages/*placeholder*`, demo modules |
| 19 | ClickHouse analytics are not end-to-end verified. | P2 | analytics service plus failed event/proto paths |
| 20 | Dirty/untracked root state makes integration accountability difficult. | P1 | `git status --short` |

## Top 20 Recommended Fixes

| Rank | Fix | Priority | Owner Domain |
|---:|---|---|---|
| 1 | Fix root `pnpm build/test/typecheck/lint` blockers. | P0 | Platform |
| 2 | Fix `@next/events` codegen path by using root `buf.gen.yaml` or package-local config. | P0 | Events |
| 3 | Fix proto lint errors and `go_package` conflicts. | P0 | Contracts |
| 4 | Fix `packages/go/eventbus` build against current `kafka-go`. | P0 | Go platform |
| 5 | Publish a route-to-contract MVP matrix for frontend/backend alignment. | P0 | Platform/Product |
| 6 | Expand gateway only to implemented MVP services: auth, profile, media/upload, feed, playback. | P1 | Gateway |
| 7 | Normalize `/services/*` layout or document approved exceptions. | P1 | Backend |
| 8 | Add CI service-layout check. | P1 | CI |
| 9 | Add regression tests for gateway JWT/authz behavior. | P1 | Security |
| 10 | Change invalid JWT behavior to reject by default. | P1 | Security |
| 11 | Remove raw IP logging or hash/truncate at ingress. | P1 | Security/Observability |
| 12 | Implement `scripts/kafka-replay` or remove references. | P1 | Events |
| 13 | Add per-category DLQs or operationally document shared DLQ ownership. | P2 | Events/SRE |
| 14 | Fix Terraform OpenSearch variable syntax. | P1 | Infrastructure |
| 15 | Update Taskfile Go commands to module-aware loops. | P2 | Tooling |
| 16 | Pin Rust toolchain/dependencies consistently. | P2 | Runtime |
| 17 | Add minimal Python tests for every AI workspace member. | P2 | AI |
| 18 | Feature-flag demo-only frontend routes and packages. | P1 | Frontend |
| 19 | Add store integration tests for every functional service. | P1 | Backend |
| 20 | Freeze new phase work until root verification is green. | P0 | Governance |

## MVP Readiness Verdict

Verdict: **Not MVP ready**.

Reason: the repository does not currently pass core verification, the external API only covers identity/profile, major MVP services such as playback/search/community/notification are scaffold or absent in the root checkout, and frontend routes rely heavily on demo data.

Minimum MVP bar before reconsidering:

1. Green root verification: TS build/test/typecheck/lint, module Go tests, buf lint/generate, Terraform fmt/validate for changed modules.
2. Implemented end-to-end path: sign up/sign in, profile, upload/media metadata, playback session, feed read, event emission, analytics ingest.
3. One frontend route set wired to live gateway contracts without demo fixtures.
4. Service layout and event contracts mechanically enforced in CI.
5. Security checks for gateway auth and privacy-safe logging.

## Confidence Level

Confidence: **0.82**.

High confidence:

- Service counts, layout findings, proto/migration inventory, Go-only backend compliance, and command failure summaries.

Medium confidence:

- MVP readiness and frontend/backend alignment, because the root has many dirty/untracked files and some apps/packages may be mid-integration.

Lower confidence:

- Runtime behavior behind unrun services, because many checks fail before deep integration tests can execute.

## Questions and Assumptions

- I treated `C:\projects\Actual Projects\next` as the authoritative root checkout.
- I excluded `.worktrees/**` and `.claude/worktrees/**` from product-code conclusions because they are branch worktrees.
- I used `CODEX` as the agent name for this audit file.
- I assumed creating `docs/AUDIT_CODEX.md` is allowed by the request and does not violate "do not change code".
- I removed only audit-generated side-effect artifacts (`Cargo.lock`, `uv.lock`, `.venv`) that were created by verification commands and were not part of the pre-existing visible status.
- I did not inspect remote GitHub CI results; this is a local repository audit.
