# 0008. Event bus: Kafka via AWS MSK

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: @next-ecosystem/platform @next-ecosystem/data
- **Tags**: events, infrastructure

## Context

Every service in NEXT emits events. We need a durable, ordered, replayable bus with strict semantics (at-least-once, partition ordering by key), partition counts in the thousands, and the ability to replay from arbitrary offsets for new consumers and disaster recovery.

## Decision

**Apache Kafka** on **AWS MSK** (KRaft, no ZooKeeper) as the canonical event bus. Three brokers per AZ, three AZs. Tiered storage enabled — hot on broker disk, warm on S3.

## Alternatives considered

- **AWS Kinesis** — simpler operationally; weaker on partition ordering at scale, less mature multi-consumer story, and the per-shard cost model gets ugly fast.
- **NATS JetStream** — good for control-plane events and pub/sub, less battle-tested for the analytics-scale fan-out we need.
- **Apache Pulsar** — strong architecture; smaller ops community and tooling ecosystem than Kafka.
- **Self-hosted Kafka on EKS** — strong control, but for a v1 team the operational lift of broker management isn't worth the savings.

## Consequences

### Positive
- Durable, ordered, replayable. The de-facto industry standard.
- Tiered storage means we can retain analytics topics for 90 days without ballooning broker disk.
- Strong ecosystem: Schema Registry, Kafka Connect, MirrorMaker for v2 multi-region.

### Negative
- MSK pricing at scale is not cheap; we will revisit self-hosted once we hit ~50k partitions.
- Kafka rebalances under load are still a foot-gun; we mitigate via static membership and cooperative rebalancing.

## Implementation notes

- Schemas in Protobuf, registered with Confluent Schema Registry self-hosted.
- Topic naming: `<domain>.<entity>.<event>.v<n>`.
- Partition keys are aggregate IDs (e.g. `creator_id`, `video_id`) to preserve per-aggregate order.
- DLQ topics: `<source>.dlq`. Replay tool in [`scripts/kafka-replay`](../../scripts/kafka-replay).
- Tiered storage: hot retention 24h on disk, longer retention transparently from S3.
