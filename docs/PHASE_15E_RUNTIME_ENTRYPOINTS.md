# Phase 15E Runtime Entrypoints

## Scope

Phase 15E makes the image-build scaffold services runtime-ready without turning
service shells into fake implementations. PR #14 added runtime entrypoints for:

- `notification-service`
- `search-service`

This follow-up PR adds runtime entrypoints for:

- `live-service`
- `community-service`
- `payment-service`
- `moderation-service`

No frontend, product workflow, or image workflow behavior is changed.

## Canonical scaffold runtime pattern

The minimal `cmd/server` pattern for a scaffold Go service is:

- parse env config with `caarlos0/env`
- initialize shared OpenTelemetry with service name, namespace, environment,
  version, and OTLP endpoint
- serve HTTP on `HTTP_ADDR` with `/healthz` and `/readyz`
- serve gRPC on `GRPC_ADDR` with the standard gRPC health service
- log structured startup/shutdown details
- drain HTTP and gRPC servers on `SIGINT` or `SIGTERM`

This pattern is intentionally smaller than a full ADR 0038 implementation. It
does not create empty `internal/api`, `internal/domain`, or `internal/store`
folders, because doing so would hide service-layout debt without implementing
real domain behavior.

## Service readiness status

| Service | Phase 15E status | Runtime behavior |
| --- | --- | --- |
| `notification-service` | Completed in PR #14 | Health-only HTTP + gRPC server |
| `search-service` | Completed in PR #14 | Health-only HTTP + gRPC server |
| `live-service` | Completed in this PR | Health-only HTTP + gRPC server |
| `community-service` | Completed in this PR | Health-only HTTP + gRPC server |
| `payment-service` | Completed in this PR | Health-only HTTP + gRPC server |
| `moderation-service` | Completed in this PR | Health-only HTTP + gRPC server |

## Expected image-build outcome

After this PR merges, every service in the image-build matrix has `cmd/server`.
The expected matrix result is **15/15 buildable services**:

- `auth-service`
- `profile-service`
- `media-service`
- `upload-service`
- `live-service`
- `feed-service`
- `recommendation-service`
- `search-service`
- `community-service`
- `payment-service`
- `notification-service`
- `moderation-service`
- `analytics-service`
- `event-gateway`
- `api-gateway`

The services that remain scaffold-level at the product/domain layer are:

- `live-service`
- `community-service`
- `payment-service`
- `moderation-service`

## Future implementation

Future service-build phases should replace health-only scaffold runtimes with
real ADR 0038 service layouts:

- `internal/api` or `internal/handler` for transport adapters
- `internal/domain` for pure domain behavior
- `internal/store` only when the service owns durable state
- `internal/eventbus` and `internal/consumer` only when event flow is real
