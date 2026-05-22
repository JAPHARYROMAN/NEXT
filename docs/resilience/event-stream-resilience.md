# NEXT Event Stream Resilience

> Kafka is the platform's nervous system ([ADR 0008](../adr/0008-event-bus.md)).
> If it loses messages, silently reorders them, or stops, the damage is
> system-wide. This document defines how the event backbone survives failure.

## 0. Doctrine

- **The event log is the durable boundary.** Many systems are rebuildable _from_
  the event log ([disaster-recovery.md](disaster-recovery.md)); the log itself
  must therefore be the most durable thing in the platform.
- **Durability is tiered.** Tier-0 events (auth, enforcement, payment, anything
  a user's correctness depends on) tolerate **zero loss**. Analytics-grade
  events tolerate bounded, measured loss.
- **Consumers are idempotent.** Delivery is at-least-once; correctness comes
  from idempotent consumers, not from pretending exactly-once is free.
- **Replay is a first-class capability**, not an emergency hack.

## 1. Broker-level durability

Per-region MSK clusters, multi-AZ:

| Setting               | Tier-0 streams             | Analytics streams        |
| --------------------- | -------------------------- | ------------------------ |
| Replication factor    | 3                          | 3                        |
| `min.insync.replicas` | 2                          | 2                        |
| Producer `acks`       | `all`                      | `1` (throughput-favored) |
| Retention             | long; tiered storage to S3 | shorter                  |

`acks=all` + RF3 + `min.insync.replicas=2` means a Tier-0 event is durably on
two brokers across two AZs before the producer is told "committed". A single
broker, or a whole AZ, can be lost with **zero acknowledged-message loss**.

Brokers spread across ≥ 3 AZs; loss of one AZ leaves a writable quorum.

## 2. Topic & partition strategy

- Topics are **category streams** ([ADR 0036](../adr/0036-event-topology.md)):
  `<category>.events.v<N>`. Bounded topic count, simpler resilience reasoning.
- **Ordering** is guaranteed **per partition key**, not globally — the envelope
  partition key (`media_id → creator_id → user_id → …`) routes related events to
  one partition, so a single entity's events are strictly ordered. The platform
  never assumes cross-key global ordering.
- Partition count is provisioned with headroom ([capacity-planning.md](capacity-planning.md));
  partitions can be added (consumers tolerate it) but never removed.

## 3. Cross-region survivability

- Each region has its own MSK cluster; producers and consumers work **locally**
  on the hot path.
- **Canonical category streams are mirrored cross-region** (MirrorMaker 2-style
  replication). A consumer in a surviving region can pick up a lost region's
  stream from the mirror.
- Mirroring is asynchronous — a region loss has a small, bounded replication-lag
  RPO for cross-region consumers; in-region Tier-0 durability remains zero-loss.
- Offsets are translated on failover so a promoted consumer resumes near where
  the lost region's consumer stopped, re-processing a bounded overlap
  (idempotency absorbs it).

## 4. DLQ survivability

- Every category stream has a dead-letter topic `<category>.events.dlq.v<N>`
  ([ADR 0036](../adr/0036-event-topology.md)).
- A message that fails processing after bounded retries goes to the DLQ **with
  its failure context** (error, attempt count, original offset) — it is never
  dropped silently.
- DLQs have the **same RF3 durability** as their parent stream — a dead-lettered
  event is still a durable event.
- DLQs are monitored; a rising DLQ rate is an alert ([sre-doctrine.md](sre-doctrine.md)),
  because it means a consumer or a contract is broken.
- DLQ messages are **re-drivable**: once the bug is fixed, the DLQ is replayed
  back into normal processing.

## 5. Replay doctrine

Replay — re-consuming historical events — is supported and governed:

- **Recovery replay** — after data corruption or a consumer bug, a consumer
  resets to an earlier offset and re-derives its state. Safe _because_ consumers
  are idempotent (§6).
- **Backfill replay** — a new consumer, or a re-versioned projection (e.g. a new
  trust-scoring model), is built by replaying history from offset 0.
- **Isolated replay** — large replays run via the `replay`-prefixed topic space
  so they do not disturb live consumers; results are swapped in atomically.
- Replay is bounded by retention + tiered storage; Tier-0 streams retain long
  enough that a full rebuild is always possible within the retention window.

## 6. Consumer recovery

- **Consumer groups** track committed offsets; a crashed consumer's partitions
  are rebalanced to peers automatically.
- **Idempotent processing** — every consumer keys on the envelope idempotency
  key, so re-delivery (the normal cost of at-least-once + rebalance overlap +
  replay) is a no-op, not a double-apply.
- **Commit-after-process** — offsets are committed only after successful
  processing, so a crash mid-message re-processes rather than skips.
- **Poison-message handling** — a message that fails repeatedly is DLQ'd (§4)
  rather than blocking the partition forever.

## 7. Acceptable-loss boundaries

| Event class                                 | Acceptable loss          | Mechanism                                                   |
| ------------------------------------------- | ------------------------ | ----------------------------------------------------------- |
| Auth, enforcement, payment, trust-affecting | **zero**                 | `acks=all`, RF3, in-region synchronous                      |
| Media lifecycle, feed interactions          | near-zero                | `acks=all`, RF3                                             |
| Analytics, telemetry                        | small, bounded, measured | `acks=1`; loss is monitored and must stay under a threshold |
| Cross-region (during a region loss)         | bounded by mirror lag    | async mirroring; idempotency on resume                      |

The boundaries are explicit so they can be _tested_ — chaos experiments
([chaos-engineering.md](chaos-engineering.md)) verify that Tier-0 loss really is
zero under broker and AZ failure.

## 8. Failure modes & responses

| Failure                         | Response                                                         |
| ------------------------------- | ---------------------------------------------------------------- |
| Single broker down              | quorum holds; no loss; broker auto-replaced                      |
| AZ down                         | writable quorum across remaining AZs; no acknowledged loss       |
| Partition leader election storm | producers retry within `acks=all`; brief latency, no loss        |
| Region cluster down             | consumers fail over to the cross-region mirror                   |
| Consumer lag spike              | autoscale the consumer group; if structural, alert + investigate |
| Schema-incompatible message     | rejected by the contract, DLQ'd, alert raised                    |

## Related documents

- [disaster-recovery.md](disaster-recovery.md) · [global-topology.md](global-topology.md) · [sre-doctrine.md](sre-doctrine.md)
- [ADR 0008 — Event bus: Kafka via MSK](../adr/0008-event-bus.md) · [ADR 0036 — Event topology](../adr/0036-event-topology.md)
