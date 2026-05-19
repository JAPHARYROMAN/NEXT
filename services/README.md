# Backend services

Fifteen microservices. Each one:

- Owns its database. No cross-service SQL reads (per [ADR 0017](../docs/adr/0017-database-per-service.md)).
- Emits and consumes events on Kafka via [`@next/events`](../packages/events).
- Speaks gRPC internally and contributes a GraphQL subgraph externally (per [ADR 0006](../docs/adr/0006-api-architecture.md)).
- Ships with `/healthz`, `/readyz`, `/metrics`, OTel instrumentation, and a service-owned k8s Helm chart.
- Has its own README documenting API + event contracts, data ownership, dependencies, and the observability dashboards it owns.

## Service template

Every Go service follows this layout:

```
services/<name>/
├── README.md                    # contracts, ownership, runbook pointers
├── Dockerfile                   # multi-stage build
├── go.mod                       # module
├── cmd/
│   └── server/
│       └── main.go              # entrypoint
├── internal/
│   ├── api/                     # gRPC + GraphQL handlers
│   ├── domain/                  # entities, business logic
│   ├── store/                   # database access
│   ├── events/                  # producers + consumers
│   └── platform/                # config, server bootstrap
├── proto/
│   └── <name>/v1/<name>.proto   # gRPC contract
├── migrations/                  # golang-migrate SQL files
└── chart/                       # Helm chart for this service
```

Rust services follow the same shape with `Cargo.toml` + `src/` instead of `go.mod` + `cmd/`.

## Catalog

| Service | Lang | Database | Topics emitted |
| --- | --- | --- | --- |
| [api-gateway](api-gateway) | Go | — | — |
| [event-gateway](event-gateway) | Go | Postgres (idempotency) | all (proxy) |
| [auth-service](auth-service) | Go | Postgres + Redis | `auth.*` |
| [profile-service](profile-service) | Go | Postgres | `profile.*` |
| [media-service](media-service) | Go + Rust | Postgres + S3 | `media.*` |
| [upload-service](upload-service) | Go | S3 (TUS) | `upload.*` |
| [live-service](live-service) | Rust + Go | Redis + S3 | `live.*` |
| [feed-service](feed-service) | Go | Redis | `feed.*` |
| [recommendation-service](recommendation-service) | Go + Rust | Qdrant + Redis | `rec.*` |
| [search-service](search-service) | Go | OpenSearch | `search.*` |
| [community-service](community-service) | Go | Postgres + Redis | `community.*` |
| [payment-service](payment-service) | Go | Postgres (ledger) | `payment.*` |
| [notification-service](notification-service) | Go | Postgres + Redis | `notification.*` |
| [moderation-service](moderation-service) | Go | Postgres + CH | `moderation.*` |
| [analytics-service](analytics-service) | Go | ClickHouse | — (terminal sink) |
