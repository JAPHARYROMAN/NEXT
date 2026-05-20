# 0036. Event topology: category streams are the canonical topic model

- **Status**: Accepted
- **Date**: 2026-05-20
- **Owners**: Architecture · Backend · Infrastructure
- **Tags**: events, kafka, governance

## Context

The Phase 10 audit ([event-architecture-audit.md](../audits/event-architecture-audit.md)
EA-1, debt TD-01) found a **dual topic catalog** in `packages/events/src/topics.ts`.
Two models coexist with no declared authority:

- **Legacy per-event topics** — one Kafka topic per event type
  (`auth.user.registered.v1`, `media.video.published.v1`, …). Used by Phases 1–4.
- **Category streams** — one topic per event category
  (`identity.events.v1`, `media.events.v1`, …). Introduced by the Phase 5
  event-bus work, alongside an envelope that already maps `event_type` → category.

Producers and consumers from different phases target different catalogs. Every
new producer or consumer currently picks a model by guess. This must be settled
before further event work.

## Decision

**Category streams are the canonical Kafka topic model.** There is one topic per
event _category_, named `<category>.events.v<N>`. The specific event type is a
field in the envelope (`event_type`), **not** part of the topic name. Consumers
subscribe to a category stream and dispatch on `event_type`.

The legacy per-event topic names become a **deprecated compatibility layer**:
retained so Phase 1–4 services keep working, marked deprecated in `topics.ts`,
and migrated to category streams on a schedule. New code must not add per-event
topics.

Each category stream has exactly one dead-letter topic,
`<category>.events.dlq.v<N>` — this also resolves the partial-DLQ gap (TD-11).

## Rationale

A per-event-topic model does not scale: NEXT already has dozens of event types
heading toward hundreds, and one Kafka topic each is an unmanageable topic count
with no aggregate ordering. Category streams keep the topic count bounded to the
~11 event categories, preserve per-partition-key ordering _within_ a category,
and match the envelope contract the Phase 5 work already built (`event_type` is
already an envelope field). It is the model the newer code assumes; making it
canonical is the smaller migration.

## Alternatives considered

- **Legacy per-event topics as canonical** — would require the newer envelope
  and analytics consumers to be rewritten, and does not scale in topic count.
  Rejected.
- **Keep both indefinitely** — the status quo; guarantees permanent drift and
  forces every author to choose. Rejected — this ADR exists to end it.
- **One global event topic** — simplest topic count, but destroys per-category
  ordering, retention, and access control. Rejected.

## Consequences

### Positive

- Bounded, predictable topic count (~11 + DLQs).
- One declared authority — no more per-author guessing.
- DLQ-per-category falls out naturally, closing TD-11.
- Matches the existing envelope and Phase 5 consumers.

### Negative

- Phase 1–4 services must migrate off per-event topics — real, scheduled work.
- Consumers must filter by `event_type`, a small per-consumer cost.

### Neutral / open questions

- The migration deadline for legacy topics is set by the integration roadmap,
  not this ADR.

## Implementation rules

- New topics are `<category>.events.v<N>`; no new per-event topics.
- Topic version is the `.v<N>` suffix; a breaking schema change to a stream cuts
  `.v<N+1>`, never mutates `.v<N>`.
- Every category stream has a `<category>.events.dlq.v<N>` dead-letter topic.
- `packages/events/src/topics.ts`: legacy `TOPICS` entries are annotated
  `@deprecated` with the target category stream.
- Consumers subscribe to a category stream and dispatch on the envelope
  `event_type`.

## Agent instructions

- **Claude** — Keep this ADR and `topics.ts` consistent. Reject PRs that add a
  per-event topic.
- **Codex** — Implement the category-stream catalog as canonical. Add
  `@deprecated` markers to legacy topics. Migrate Phase 1–4 producers/consumers
  per the roadmap. Define one DLQ per category. Absorb the orphaned `REC_*`
  constants (TD-08) into the category model.
- **Composer** — Frontend does not touch Kafka; no action.
- **Copilot** — Never scaffold a new per-event Kafka topic.

## Review triggers

- The event-category set itself changes (a category added or split).
- Topic count or partition strategy becomes an operational concern.
- A category stream needs per-event-type retention or ACLs that the shared
  stream cannot express.

## Related documents

- [0008. Event bus: Kafka via MSK](0008-event-bus.md)
- [0039. Protobuf as the single event-definition source of truth](0039-event-schema-source-of-truth.md)
- [Event architecture audit](../audits/event-architecture-audit.md)
- [Technical debt register](../technical-debt/technical-debt-register.md) — TD-01, TD-08, TD-11
