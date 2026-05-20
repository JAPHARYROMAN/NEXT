# Event Standards

> The enforceable standard for every event on the NEXT bus. Grounded in
> [ADR 0008](../adr/0008-event-bus.md), [ADR 0036](../adr/0036-event-topology.md)
> (category-stream topology), and [ADR 0039](../adr/0039-event-schema-source-of-truth.md)
> (protobuf source of truth).

Status: **binding**.

## 1. Topic model

- Events travel on **category streams**: `<category>.events.v<N>`
  (`identity.events.v1`, `media.events.v1`, `commerce.events.v1`, …).
- The specific event type is an envelope field, **not** a topic. **No new
  per-event topics** — the legacy per-event names are a deprecated compatibility
  layer only ([ADR 0036](../adr/0036-event-topology.md)).
- Every category stream has a DLQ: `<category>.events.dlq.v<N>`.
- A new event **category** is an architectural change — it requires an ADR.

## 2. Envelope

Every event carries the standard envelope: `event_id`, `event_type`,
`event_version`, `category`, `emitted_at`, `correlation_id`, `request_id`,
`idempotency_key`, `partition_key`, and the typed payload. The envelope is
consistent across all categories — a consumer parses one envelope shape.

## 3. Schema — protobuf is the source of truth

- Every payload is a Protobuf message under
  `packages/events/schemas/<category>/v<N>/` ([ADR 0039](../adr/0039-event-schema-source-of-truth.md)).
- Go and TypeScript types are **generated** from the proto — never hand-written.
- An event payload is defined **once**, in proto. A second definition (a
  hand-written mirror type, a parallel Zod payload schema) is a violation.
- Buf governs schema evolution; `buf breaking` runs in CI
  ([enforcement-mechanisms.md](enforcement-mechanisms.md)).

## 4. Naming

- Event type: `<category>.<entity>.<event>.v<n>` —
  e.g. `media.video.published.v1`, `commerce.payout.completed.v1`.
- `<event>` is a **past-tense fact** — `created`, `published`, `failed` — an
  event records something that _happened_, not a command.
- See [naming-conventions.md](naming-conventions.md) for the full grammar.

## 5. Versioning

- The stream carries `.v<N>`; the event type carries `.v<n>`.
- A **backward-compatible** payload change (adding an optional field) keeps the
  version.
- A **breaking** change cuts a new version; producers and consumers migrate; the
  old version is retired only when no consumer reads it.
- `buf breaking` blocks an accidental breaking change in CI.

## 6. Idempotency

- Every event carries an `idempotency_key` = the business-operation key.
- **Every consumer is idempotent** — keyed on `idempotency_key`, re-processing
  is a no-op. Delivery is at-least-once; correctness comes from idempotent
  consumers, not from assuming exactly-once.
- This is what makes replay, rebalance overlap, and webhook re-delivery safe.

## 7. Ordering

- Ordering is guaranteed **per partition key**, not globally. The `partition_key`
  routes a single entity's events to one partition.
- Consumers MUST NOT assume cross-key global ordering.
- Partition-key precedence is defined by the envelope contract (e.g.
  `media_id → creator_id → user_id → session_id → …`).

## 8. DLQ doctrine

- An event that fails processing after bounded retries goes to the category DLQ
  **with its failure context** (error, attempt count, original offset) — never
  dropped silently.
- DLQs have the same durability (RF3) as their parent stream.
- A rising DLQ rate is an alert — it means a consumer or a contract is broken.
- DLQ messages are **re-drivable** once the cause is fixed.

## 9. Durability tiers

- **Tier-0 events** (auth, enforcement, payment/commerce, trust-affecting) —
  `acks=all`, RF3, **zero acceptable loss**.
- **Analytics-grade events** — `acks=1`; small, _measured_ loss tolerated.
- Tiers are explicit so chaos tests can verify them
  ([docs/resilience/event-stream-resilience.md](../resilience/event-stream-resilience.md)).

## 10. Replay

- Replay (recovery, backfill, re-versioned projections) is a **first-class
  capability**, safe because consumers are idempotent (§6).
- Large replays run via the `replay`-prefixed topic space so live consumers are
  undisturbed.

## 11. Ownership

- A service emits events for **its own domain only** — never another domain's.
- The owning service owns the schema, the producer, and the versioning of its
  events.
- A consumer never assumes a producer's internals — only the published contract.

## 12. Prohibited patterns

- ✗ A new per-event Kafka topic.
- ✗ An event payload defined anywhere but proto; a hand-written mirror type.
- ✗ A non-idempotent consumer.
- ✗ A consumer assuming global event ordering.
- ✗ Silently dropping a failed event instead of DLQ-ing it.
- ✗ A service emitting events for a domain it does not own.
- ✗ A new event category without an ADR.
- ✗ An unversioned event type.

## Related

- [ADR 0008](../adr/0008-event-bus.md) · [ADR 0036](../adr/0036-event-topology.md) · [ADR 0039](../adr/0039-event-schema-source-of-truth.md) · [docs/resilience/event-stream-resilience.md](../resilience/event-stream-resilience.md) · [naming-conventions.md](naming-conventions.md)
