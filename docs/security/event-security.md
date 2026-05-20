# Event Security

> Securing the nervous system. The Kafka event bus carries the platform's most
> consequential signals — auth, enforcement, payments, trust. A forged or
> replayed event is a way to lie to the whole platform; this is how that is
> prevented.

## 0. Principle

The event bus is high-trust infrastructure: many systems are _driven by_ and
_rebuilt from_ the event log ([docs/resilience/event-stream-resilience.md](../resilience/event-stream-resilience.md)).
Therefore an event must be **authentic** (really from its claimed producer),
**unforgeable**, **non-replayable**, and **valid** (schema-conformant). A
compromise of the event layer is a compromise of everything downstream.

Builds on [docs/standards/event-standards.md](../standards/event-standards.md);
this doc is the security depth.

## 1. Trusted producers

- A service emits events **only for its own domain**
  ([event-standards.md](../standards/event-standards.md)) — and Kafka enforces
  it: a producer authenticates by **workload identity**
  ([service-authentication.md](service-authentication.md)) and topic ACLs
  (§3) restrict which identity may produce to which category stream.
- The envelope records the producing service; a consumer can see, and policy
  can check, that an event on `commerce.events.v1` came from a commerce-domain
  producer — not from somewhere else.
- There is no anonymous or shared producer identity.

## 2. Event authenticity

- Every event carries the standard envelope — `event_id`, `event_type`,
  producer, `emitted_at`, `correlation_id`, `idempotency_key`
  ([event-standards.md](../standards/event-standards.md)).
- Authenticity rests on: the producer's authenticated Kafka connection (§1) +
  the topic ACL (§3) + envelope integrity. For the highest-sensitivity events
  (auth, enforcement, financial), an **authenticated/signed envelope** lets a
  consumer verify producer authenticity _independent of the broker_ — integrity
  that holds for the whole path, not just the producer→broker hop
  ([service-authentication.md](service-authentication.md) §5).
- A consumer validates the envelope and the producer claim before acting.

## 3. Kafka ACL strategy

- Kafka authorization is **default-deny**.
- **Produce** ACL: only the owning domain's service identity may produce to a
  given `<category>.events.v<N>` stream.
- **Consume** ACL: a consumer is granted read on exactly the streams it needs —
  least privilege ([zero-trust-architecture.md](zero-trust-architecture.md)).
- DLQ topics carry the same ACL discipline as their parent stream.
- ACLs are declared as code alongside the topic definitions; an ACL change is
  reviewed.

## 4. Replay-attack prevention

- Every event carries an **idempotency key**; every consumer is **idempotent**
  ([event-standards.md](../standards/event-standards.md)). A re-delivered _or
  maliciously replayed_ event is a no-op — replaying a `payment.succeeded` event
  moves no extra money ([docs/economy/ledger-architecture.md](../economy/ledger-architecture.md)).
- `emitted_at` + the `event_id` let a consumer reject an event that is
  implausibly old or already seen.
- Idempotency is the structural defense: NEXT does not try to make replay
  _impossible_ (at-least-once delivery makes re-delivery normal) — it makes
  replay _harmless_.

## 5. Event validation

- Every payload is a **Protobuf message** validated against its schema
  ([ADR 0039](../adr/0039-event-schema-source-of-truth.md)); a malformed or
  schema-violating event is rejected, not processed.
- A consumer validates before it acts — a poisoned or malformed event goes to
  the **DLQ with its failure context**, never silently into business logic.
- `buf breaking` in CI prevents a producer from shipping a schema-incompatible
  change that could be used to confuse consumers
  ([docs/standards/enforcement-mechanisms.md](../standards/enforcement-mechanisms.md)).

## 6. Encryption considerations

- Event traffic is **encrypted in transit** — TLS between clients and brokers,
  mTLS on the surrounding mesh.
- Most event payloads are operational metadata, not raw secrets — and **secrets
  and raw sensitive data do not belong in event payloads** in the first place
  ([docs/standards/security-standards.md](../standards/security-standards.md)).
- Where an event must carry sensitive fields, those fields are **minimized,
  tokenized, or referenced** (an id pointing at access-controlled data) rather
  than carried in clear; field-level encryption is applied where the data's
  sensitivity requires it.
- Kafka data at rest is encrypted at the storage layer.

## 7. DLQ trust handling

- A DLQ contains events that **failed** processing — some failures are benign
  (a transient bug), some are adversarial (a forged or poisoned event).
- DLQ events are therefore treated as **untrusted on re-drive** — re-processing
  a DLQ event re-runs full validation and authenticity checks; a DLQ is not a
  trusted fast-path back into the system.
- A rising DLQ rate is a **security signal** as well as a reliability one
  ([security-observability.md](security-observability.md)) — it can indicate an
  attempt to poison a consumer.

## 8. Schema-drift abuse

- Schema evolution is governed — versioned, `buf breaking`-checked, proto as the
  single source of truth ([event-standards.md](../standards/event-standards.md),
  [ADR 0039](../adr/0039-event-schema-source-of-truth.md)).
- This closes "schema-drift abuse" — an attacker cannot exploit a divergence
  between what a producer sends and what a consumer expects, because there is
  one governed schema and CI enforces compatibility.

## 9. Prohibited patterns

- ✗ An unauthenticated or shared-identity producer.
- ✗ A service producing to a stream its identity is not ACL'd for.
- ✗ A non-idempotent consumer (a replay vulnerability).
- ✗ A consumer acting on an unvalidated payload.
- ✗ Secrets or raw sensitive data in an event payload.
- ✗ Re-driving a DLQ event without re-validating it.
- ✗ Default-allow Kafka ACLs.

## Related

- [docs/standards/event-standards.md](../standards/event-standards.md) · [service-authentication.md](service-authentication.md) · [docs/resilience/event-stream-resilience.md](../resilience/event-stream-resilience.md) · [ADR 0008](../adr/0008-event-bus.md) · [ADR 0039](../adr/0039-event-schema-source-of-truth.md)
