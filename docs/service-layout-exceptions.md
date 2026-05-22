# Service Layout Exceptions

Phase 14 classifies the output of
`scripts/hygiene/validate-service-layout.sh` without weakening the validator.
The binding layout remains ADR 0038: functional Go services use
`cmd/server`, `internal/api`, `internal/domain`, and `internal/store`, with
event and migration folders only when needed.

The exception list in `scripts/hygiene/service-exceptions.txt` is explicit and
temporary. It suppresses scaffold-only, future implementation, or approved
structural exceptions so the validator keeps reporting real layout drift.

## Classification table

| Service                         | Violation                                                                 | Classification                                                                       | Owner                                                       | Priority |
| ------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------- | -------- |
| `_template`                     | Missing `cmd/server`, `internal/api`, `internal/domain`, `internal/store` | Approved exception: not a deployable service                                         | Architecture + Backend                                      | P3       |
| `access-control-service`        | Missing `internal/domain`                                                 | Scaffold-only: README marks status scaffolded                                        | `@next-ecosystem/identity` + `@next-ecosystem/security`     | P2       |
| `account-recovery-service`      | Missing `internal/domain`                                                 | Scaffold-only: README marks status scaffolded                                        | `@next-ecosystem/identity`                                  | P2       |
| `analytics-service`             | Missing `internal/domain`, `internal/store`                               | Real drift: Phase 5 layout predates ADR 0038                                         | `@next-ecosystem/data`                                      | P1       |
| `api-gateway`                   | Missing `internal/api`, `internal/domain`, `internal/store`               | Approved exception: edge GraphQL ingress with `internal/gql` and no datastore        | `@next-ecosystem/platform`                                  | P2       |
| `candidate-generation-service`  | Missing `cmd/server`, `internal/api`, `internal/domain`, `internal/store` | Future implementation: README/proto shell only                                       | `@next-ecosystem/discovery`                                 | P2       |
| `cdn-routing-service`           | Missing `cmd/server`, `internal/api`, `internal/domain`, `internal/store` | Future implementation: README/proto shell only                                       | `@next-ecosystem/media`                                     | P2       |
| `clip-generation-service`       | Missing `cmd/server`, `internal/api`, `internal/domain`, `internal/store` | Future implementation: README/proto shell only                                       | `@next-ecosystem/media`                                     | P2       |
| `community-service`             | Missing `cmd/server`, `internal/api`, `internal/domain`, `internal/store` | Future implementation: social service shell only                                     | `@next-ecosystem/social`                                    | P1       |
| `creator-identity-service`      | Missing `internal/domain`                                                 | Scaffold-only: README marks status scaffolded                                        | `@next-ecosystem/creator`                                   | P2       |
| `device-graph-service`          | Missing `internal/domain`                                                 | Scaffold-only: README marks status scaffolded                                        | `@next-ecosystem/identity`                                  | P2       |
| `discovery-service`             | Missing `cmd/server`, `internal/api`, `internal/domain`, `internal/store` | Future implementation: discovery surface shell only                                  | `@next-ecosystem/discovery`                                 | P1       |
| `event-gateway`                 | Missing `internal/api`, `internal/domain`, `internal/store`               | Real drift: active gateway still uses pre-ADR `internal/gateway/events/kafka` layout | `@next-ecosystem/platform`                                  | P1       |
| `identity-graph-service`        | Missing `internal/domain`, `internal/store`                               | Scaffold-only: README marks status scaffolded; `internal/graph` must be split later  | `@next-ecosystem/identity`                                  | P2       |
| `live-service`                  | Missing `cmd/server`, `internal/api`, `internal/domain`, `internal/store` | Future implementation: documented Go control plane is not present yet                | `@next-ecosystem/streaming`                                 | P1       |
| `media-analytics-service`       | Missing `cmd/server`, `internal/api`, `internal/domain`, `internal/store` | Future implementation: README/proto shell only                                       | `@next-ecosystem/media`                                     | P2       |
| `media-metadata-service`        | Missing `cmd/server`, `internal/api`, `internal/domain`, `internal/store` | Future implementation: README/proto shell only                                       | `@next-ecosystem/media`                                     | P2       |
| `media-processing-orchestrator` | Missing `internal/domain`                                                 | Real drift: `internal/saga` should be split or promoted into domain boundary         | `@next-ecosystem/media`                                     | P2       |
| `media-search-service`          | Missing `cmd/server`, `internal/api`, `internal/domain`, `internal/store` | Future implementation: README/proto shell only                                       | `@next-ecosystem/media`                                     | P2       |
| `moderation-service`            | Missing `cmd/server`, `internal/api`, `internal/domain`, `internal/store` | Future implementation: trust and safety service shell only                           | `@next-ecosystem/trust-safety`                              | P1       |
| `notification-auth-service`     | Missing `internal/domain`                                                 | Scaffold-only: README marks status scaffolded                                        | `@next-ecosystem/identity` + `@next-ecosystem/messaging`    | P2       |
| `notification-service`          | Missing `cmd/server`, `internal/api`, `internal/domain`, `internal/store` | Future implementation: messaging service shell only                                  | `@next-ecosystem/messaging`                                 | P2       |
| `payment-service`               | Missing `cmd/server`, `internal/api`, `internal/domain`, `internal/store` | Future implementation: high-reliability payments shell only                          | `@next-ecosystem/payments`                                  | P1       |
| `personalization-service`       | Missing `cmd/server`, `internal/api`, `internal/domain`, `internal/store` | Future implementation: discovery model service shell only                            | `@next-ecosystem/discovery`                                 | P2       |
| `playback-service`              | Missing `cmd/server`, `internal/api`, `internal/domain`, `internal/store` | Future implementation: media playback shell only                                     | `@next-ecosystem/media`                                     | P1       |
| `ranking-service`               | Missing `cmd/server`, `internal/api`, `internal/domain`, `internal/store` | Future implementation: documented Go coordinator is not present yet                  | `@next-ecosystem/discovery`                                 | P1       |
| `search-service`                | Missing `cmd/server`, `internal/api`, `internal/domain`, `internal/store` | Future implementation: discovery search shell only                                   | `@next-ecosystem/discovery`                                 | P1       |
| `semantic-retrieval-service`    | Missing `cmd/server`, `internal/api`, `internal/domain`, `internal/store` | Future implementation: vector retrieval shell only                                   | `@next-ecosystem/discovery`                                 | P2       |
| `session-service`               | Missing `internal/domain`                                                 | Real drift: functional identity service has API/store but no pure domain package     | `@next-ecosystem/identity`                                  | P1       |
| `subtitle-service`              | Missing `cmd/server`, `internal/api`, `internal/domain`, `internal/store` | Future implementation: media subtitle shell only                                     | `@next-ecosystem/media`                                     | P2       |
| `thumbnail-service`             | Missing `cmd/server`, `internal/api`, `internal/domain`, `internal/store` | Future implementation: media thumbnail shell only                                    | `@next-ecosystem/media`                                     | P2       |
| `transcoding-service`           | Missing `internal/domain`                                                 | Real drift: `internal/ladder` should be split or promoted into domain boundary       | `@next-ecosystem/media`                                     | P2       |
| `trust-service`                 | Missing `internal/domain`                                                 | Scaffold-only: README marks status scaffolded                                        | `@next-ecosystem/trust-safety` + `@next-ecosystem/identity` | P1       |
| `upload-service`                | Missing `internal/domain`                                                 | Real drift: functional upload service has API/blob/store but no pure domain package  | `@next-ecosystem/media`                                     | P1       |
| `video-segmentation-service`    | Missing `cmd/server`, `internal/api`, `internal/domain`, `internal/store` | Future implementation: media segmentation shell only                                 | `@next-ecosystem/media`                                     | P2       |

## Remaining actionable validator output

After applying `service-exceptions.txt`, the validator should continue to fail
on real drift only:

| Service                         | Required follow-up                                                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `analytics-service`             | Realign pre-ADR `internal/clickhouse/config/consumer/events/kafka/metrics` into ADR 0038 `domain`, `store`, `eventbus`, and `consumer` packages. |
| `event-gateway`                 | Realign `internal/gateway/events/kafka` into ADR 0038 transport, domain, and event adapter boundaries.                                           |
| `media-processing-orchestrator` | Extract orchestration rules from `internal/saga` into an explicit pure `internal/domain` package or rename with tests.                           |
| `session-service`               | Extract session and refresh-token invariants into `internal/domain`.                                                                             |
| `transcoding-service`           | Extract ladder/rendition decision logic into `internal/domain`.                                                                                  |
| `upload-service`                | Extract upload session and asset invariants into `internal/domain`.                                                                              |

No P0 item is currently identified. P1 real drift remains in
`analytics-service`, `event-gateway`, `session-service`, and `upload-service`.
P1 future implementation shells remain visible in this document but are not
useful validator failures until implementation begins.
