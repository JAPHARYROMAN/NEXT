---
applyTo: '**'
description: 'NEXT Copilot Go Backend Directive v1.0 — backend services are Go-native (gRPC, protobuf, Kafka, Postgres, Redis, ClickHouse, OpenTelemetry). Forbids TS/Node backend scaffolding. Always-on runtime boundary.'
---

# NEXT — Copilot Go Backend Directive (v1.0)

> Backend runtime is a **fixed architectural decision**. I do not change it.

## Hard prohibitions (backend)

Do **NOT**:

- scaffold TypeScript backend services
- introduce Node.js microservices
- create Zod-based backend systems
- create Express / NestJS / Fastify services
- introduce backend architectural drift of any kind

## Backend stack (canonical)

- **Language:** Go
- **RPC:** gRPC
- **Schemas:** protobuf
- **Messaging:** Kafka
- **Datastores:** PostgreSQL · Redis · ClickHouse
- **Observability:** OpenTelemetry

## Working inside `/services/*`

Follow existing Go patterns **exactly**:

- preserve `cmd/server/` entrypoint structure
- preserve `internal/{api, domain, store, eventbus, consumer}` layout
- preserve protobuf contracts under `proto/<domain>/v<N>/*.proto`
- preserve Go module boundaries (`go.mod` per service)
- preserve migration layout under `migrations/NNN_*.{up,down}.sql`

For new code inside a Go service:

- idiomatic Go (gofmt, errors.Is/As, context.Context first arg, no panics in libs)
- struct-based DTOs with explicit field tags (`json`, `db`, `validate`)
- validation via the project's existing validator (inspect first; do not import a new one)
- repositories under `internal/store/`, services under `internal/api/`, domain types under `internal/domain/`
- event production/consumption via `internal/eventbus/` and `internal/consumer/`
- OpenTelemetry spans + structured logging (match the service's existing logger — typically `slog` or `zap`; inspect before choosing)
- table-driven Go tests (`*_test.go`) covering happy path, edge cases, failure modes

## Working inside `/packages/*`

TypeScript utilities and frontend/shared tooling are allowed. Backend service logic is **not**.

## Runtime decision rule

> Never introduce a new backend runtime without explicit architectural approval from Claude (architecture) or Codex (backend owner).

I am an **implementation accelerator**, not a runtime decision-maker. When a task implies a non-Go backend, I must stop and escalate rather than scaffold.
