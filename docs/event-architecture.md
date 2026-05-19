# Event architecture

The bus is the spine. Every state change in NEXT emits a typed event onto Kafka. Per [ADR 0008](adr/0008-event-bus.md) and [ADR 0019](adr/0019-schema-first.md).

## Topology

```
producers (services)
        │  (idempotent, key by aggregate_id)
        ▼
┌─────────────────────────────┐
│      MSK Kafka (3 AZ)       │  ← tiered storage to S3 for long retention
└────────────┬────────────────┘
             │
   ┌─────────┼──────────────────────────┐
   ▼         ▼                          ▼
consumers   stream processors      analytics-service
(services)  (Flink / ksqlDB)        (terminal sink → ClickHouse)
```

## Naming

```
<domain>.<entity>.<event>.v<n>
```

Examples: `media.video.published.v1`, `auth.session.started.v1`, `payment.intent.succeeded.v1`.

DLQ topics: `<topic>.dlq`.

## Schemas

- Format: Protobuf.
- Validation: [protovalidate](https://github.com/bufbuild/protovalidate) field annotations.
- Registry: Confluent Schema Registry (self-hosted).
- Compatibility: `BACKWARD` (consumers can read producers' previous schema).

Schemas live under [`packages/events/schemas`](../packages/events/schemas) and per-service `services/<svc>/proto/events/`.

## Partition keys

| Topic family | Partition key | Why |
| --- | --- | --- |
| `auth.*` | `user_id` | Per-user ordering. |
| `profile.*` | `user_id` | Per-user ordering. |
| `media.*` | `video_id` | Per-video ordering. |
| `upload.*` | `creator_id` | Spread per-creator load. |
| `live.*` | `stream_id` | Per-stream ordering. |
| `feed.*` | `user_id` | Personalized fanout. |
| `rec.*` | `user_id` | Personalized fanout. |
| `community.*` | `community_id` | Per-community ordering. |
| `payment.*` | `wallet_id` | Per-wallet ordering. |
| `moderation.*` | `case_id` | Per-case ordering. |
| `analytics.*` | random | Maximize parallel ingest. |
| `audit.*` | `actor_id` | Per-actor audit trail. |

## Retention

| Family | Hot retention | Tiered (S3) retention |
| --- | --- | --- |
| `auth.*` | 24 h | 7 days |
| `profile.*`, `media.*`, `community.*` | 24 h | 30 days |
| `feed.*`, `rec.*` | 24 h | 7 days |
| `analytics.*` | 24 h | 90 days |
| `audit.*` | 24 h | 7 years (Glacier after 90 days) |
| `*.dlq` | 7 days | 30 days |

## Producing

Producers use the language-native SDK in [`packages/{ts,go,rust}/eventbus`](../packages):

- Idempotence enabled.
- Schema-validated payloads.
- W3C trace context propagated via headers.
- Acks: `all`.

## Consuming

Consumers use [`packages/{ts,go,rust}/eventbus`](../packages):

- Cooperative rebalancing.
- Per-message OTel span linked to producer span via headers.
- Errors → DLQ after configured retry exhaustion.
- Exactly-once is *not* guaranteed; downstream handlers must be idempotent (typically keyed by `event_id`).

## Replay

Each topic supports replay from arbitrary offsets via [`scripts/kafka-replay`](../scripts/kafka-replay). Useful for:
- New consumer onboarding (catch-up from oldest offset).
- Backfilling a downstream index after a model change.
- DR recovery (replay from S3-tiered offsets after a brief outage).

## Versioning

- **Additive changes** (new optional field): same topic, bump schema, backward-compatible.
- **Breaking changes**: emit a new `*.v<n+1>` topic. Producer dual-writes both topics for the migration window. Consumers migrate, then `v<n>` is deprecated and (eventually) retired.

## Outbox pattern

Tier-1 services with both database writes and event emissions (`auth-service`, `payment-service`, `media-service`) use the **outbox pattern**:

1. Write entity + outbox row in one DB transaction.
2. Outbox publisher reads new rows and publishes to Kafka.
3. Marks row as published once Kafka acks.

This avoids the "wrote to DB but failed to emit" failure mode without requiring distributed transactions.
