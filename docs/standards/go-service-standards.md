# Go Service Standards

> The enforceable standard for every backend service under `/services`. A
> reviewer or CI check should be able to hold any service against this document
> and get a yes/no answer.

Status: **binding**. Grounded in [ADR 0007](../adr/0007-backend-languages.md)
(Go backend), [ADR 0038](../adr/0038-canonical-go-service-layout.md) (canonical
layout), [ADR 0037](../adr/0037-compute-coordinator-worker-split.md) (compute
workers).

## 1. Runtime

- A `/services/*` directory **MUST** be a Go module. No TypeScript/Node backend
  service ([runtime governance](../governance/runtime-governance.md)).
- A perf-critical worker **MAY** be Rust, and **MUST** live at
  `<coordinator>/worker/` (or a named sibling) — never nested in an unrelated
  service ([ADR 0037](../adr/0037-compute-coordinator-worker-split.md)).

## 2. Canonical layout

Every functional service **MUST** follow [ADR 0038](../adr/0038-canonical-go-service-layout.md):

```
services/<name>/
  cmd/server/main.go        entrypoint: config, telemetry, wiring, shutdown
  internal/
    api/                    gRPC + HTTP handlers — the transport adapter
    domain/                 business logic; pure; no I/O; unit-tested
    store/                  datastore adapters (Postgres, Redis)
    eventbus/               Kafka producers     (only if it emits events)
    consumer/               Kafka consumers     (only if it consumes events)
  proto/<domain>/v<N>/<domain>.proto
  migrations/NNN_*.up.sql + NNN_*.down.sql   (only if it owns a database)
  go.mod
  README.md
```

- `api`, `domain`, `store` are **mandatory** for a functional service.
- `eventbus` / `consumer` exist **only** when the service produces / consumes
  events. No empty placeholder directories.
- `migrations/` exists only for a service owning a database.

## 3. Package boundary rules

- **`domain` MUST NOT import `store`, `api`, `eventbus`, `consumer`, or any I/O
  package.** Domain logic is pure and unit-testable. This is the single most
  important structural rule — a violation is a merge blocker.
- `api` and `store` are **adapters** — they depend on `domain`, never the
  reverse.
- Cross-service Go imports are **forbidden** — services communicate over gRPC /
  events, never by importing each other's `internal/`.
- A service depends on shared modules only via `packages/go/*`.

## 4. Protobuf

- One proto package per service domain: `next.<domain>.v<N>`,
  `go_package = ".../gen/go/<domain>/v<N>;<domain>v<N>"`.
- Buf governs ([ADR 0019](../adr/0019-schema-first.md)); breaking changes are
  caught by `buf breaking` and require a new `v<N+1>`.
- Request validation uses `buf.validate` field constraints — see
  [api-standards.md](api-standards.md).

## 5. The `cmd/server/main.go` pattern

Every service entrypoint **MUST**: parse config from env; initialize telemetry
([observability-standards.md](observability-standards.md)); construct the
datastore pool; expose `/healthz` (liveness) + `/readyz` (readiness with a
dependency probe); register the gRPC service with the OTel stats handler +
`grpc_health_v1`; serve HTTP behind `otelhttp`; and shut down gracefully on
SIGINT/SIGTERM. This is the established pattern across all functional services;
new services replicate it (the `_template` encodes it).

## 6. Store / repository pattern

- `store` exposes a typed repository over the datastore; SQL does not leak above
  `store`.
- Each service owns its own database ([ADR 0017](../adr/0017-database-per-service.md));
  no service reads another's tables.
- Writes that must be atomic use a transaction; transaction boundaries live in
  `store`, not `domain`.

## 7. Event emission

- A service emits events only for **its own domain**
  ([event-standards.md](event-standards.md)).
- Events go to the canonical category stream ([ADR 0036](../adr/0036-event-topology.md));
  payloads are proto-defined ([ADR 0039](../adr/0039-event-schema-source-of-truth.md)).
- Consumers are **idempotent** — keyed on the envelope idempotency key.

## 8. Validation doctrine

- Validate at the **boundary** — `api` validates inbound requests (uuid format,
  required fields, ranges) before calling `domain`.
- `domain` may assume its inputs are well-formed — it does not re-validate
  transport concerns; it enforces _business_ invariants.
- Trust internal callers; validate external input. Do not scatter defensive
  checks for states that cannot occur.

## 9. Observability minimums

Every service **MUST** meet [observability-standards.md](observability-standards.md):
OTel tracing (`otelgrpc` + `otelhttp`), Prometheus metrics, structured JSON
logs, `/healthz` + `/readyz`, trace-context propagation. A service without
telemetry does not pass review.

## 10. Resilience requirements

- Cross-service and cross-region calls **MUST** have a timeout and a fallback /
  circuit breaker ([docs/resilience/graceful-degradation.md](../resilience/graceful-degradation.md)).
- `/readyz` reflects real dependency health; `/healthz` is dependency-light.
- The service degrades, it does not cascade — a slow dependency trips a breaker.

## 11. Migrations

- File names: `NNN_<slug>.up.sql` + `NNN_<slug>.down.sql`, paired, sequential.
- Every `up` has a working `down` — migrations are reversible
  ([database-standards.md](database-standards.md)).
- Migrations are concurrency-safe (safe under live writes).

## 12. Prohibited patterns / anti-patterns

- ✗ `domain` importing I/O.
- ✗ Cross-service `internal/` imports.
- ✗ A service reading another service's database.
- ✗ A backend service in TypeScript/Node.
- ✗ A perf worker nested in an unrelated service.
- ✗ A new service that does not follow the canonical layout.
- ✗ Shipping a service with no telemetry, no health endpoints, or no tests
  ([testing-standards.md](testing-standards.md)).
- ✗ An un-reversible migration without a documented, reviewed reason.

## 13. Escalation

A service that genuinely cannot fit the canonical layout (e.g. a pure batch job
with no `api`) escalates to architecture review ([architecture governance](../governance/architecture-governance.md))
— the exception is decided as an ADR, not improvised.

## Related

- [ADR 0038](../adr/0038-canonical-go-service-layout.md) · [api-standards.md](api-standards.md) · [event-standards.md](event-standards.md) · [observability-standards.md](observability-standards.md) · [testing-standards.md](testing-standards.md)
