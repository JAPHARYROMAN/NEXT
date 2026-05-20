# Event Architecture Audit

- **Phase**: 10 — System Integration Review
- **Date**: 2026-05-20
- **Auditor**: Claude (architecture governor)
- **Scope**: `packages/events`, event schemas, topic catalog, producers/consumers, DLQ + replay — against [ADR 0008](../adr/0008-event-bus.md) and [ADR 0019](../adr/0019-schema-first.md)

## Executive summary

The event layer has a **strong foundation** — a validated envelope with
idempotency keys and correlation IDs, a versioned proto schema set, and an
explicit partition-key precedence. But it carries the **clearest multi-agent
drift in the codebase**: a **dual topic catalog** (a Phase-5 category-stream
model layered on top of the legacy per-event model) with no stated authority,
and **two event-definition mechanisms** (protobuf schemas vs. Zod contracts)
without a declared source of truth. One P1, three P2.

## Findings

### EA-1 — Dual topic catalog with no declared authority · Severity: P1

**Evidence**: `packages/events/src/topics.ts` contains **two coexisting
catalogs**: `CATEGORY_TOPICS` (Phase-5 canonical category streams —
`identity.events.v1`, `media.events.v1`, …) and the legacy `TOPICS` map of
per-event topics (`auth.user.registered.v1`, `media.video.published.v1`, …).
The file comment says legacy topics "remain … until they migrate", but no ADR,
no migration plan, and no deprecation markers exist. Producers and consumers
across phases were written against _different_ catalogs — Phases 1–4 emit
per-event topics; Phase-5 analytics consumes category streams.
**Recommended action**: An ADR must declare the authoritative model. Recommended:
category streams (`<category>.events.v1`) are canonical; the per-event names
become a documented legacy compatibility layer with a migration deadline.
Annotate `topics.ts` with deprecation markers once decided.
**Owner**: Claude (ADR) + Codex (events package) · **Blocker**: Yes — blocks new
producer/consumer work, which would otherwise pick a catalog by guess · **Next
step**: Draft the event-topology ADR; see drift report DR-1.

### EA-2 — Two event-definition mechanisms · Severity: P2

**Evidence**: Events are defined twice over: (a) protobuf schemas under
`packages/events/schemas/*/v1/*.proto` (10 schemas: auth, media, payment,
recommendation, audit), generating Go types; and (b) a Zod-based contract +
envelope in `packages/events/src/contracts/` (Codex, Phase 5). Plus hand-written
TS mirror packages (`@next/media-events`, `@next/trust-events` — see
package-boundary-audit PB-3). Three representations of the same contracts can
silently diverge.
**Recommended action**: Declare protobuf the schema source of truth ([ADR 0019](../adr/0019-schema-first.md)
already says "schema-first via Protobuf"). The Zod envelope should validate
_around_ proto-derived payloads, not redefine them; TS event types should be
generated from proto, not hand-written.
**Owner**: Codex (events package) · **Blocker**: No · **Next step**: Fold into
the event-topology ADR (EA-1).

### EA-3 — Envelope format is sound · Severity: PASS

**Evidence**: `packages/events/src/contracts/envelope.ts` enforces a consistent
envelope: `event_type` → category mapping, payload-schema validation,
`event_version` pinned, idempotency key, correlation ID, request ID. Partition-
key precedence is explicit (`media_id → creator_id → user_id → session_id →
device_id → correlation_id → event_id`).
**Recommended action**: None — this is good work. Make it the canonical envelope
in the EA-1 ADR.
**Owner**: — · **Blocker**: No · **Next step**: —

### EA-4 — DLQ coverage is partial · Severity: P2

**Evidence**: `DEAD_LETTER_TOPICS` defines explicit DLQs for only 4 categories
(identity, media, playback, analytics); `deadLetterTopicForCategory` routes all
other categories to the **analytics DLQ** as a fallback. A recommendation or
commerce event that fails lands in the analytics DLQ — wrong owner, wrong
alerting.
**Recommended action**: Define a DLQ per event category, or document explicitly
that a shared DLQ is intentional and how cross-category triage works.
**Owner**: Codex (events package) · **Blocker**: No · **Next step**: Roadmap P2
item.

### EA-5 — Replay strategy is declared but not implemented · Severity: P2

**Evidence**: `REPLAY_TOPIC_PREFIX` is defined in `topics.ts` and replay is
named in `docs/events/replay-and-dlq.md`, but no replay producer/consumer or
runbook-grade procedure was found. [ADR 0028](../adr/0028-media-pipeline-orchestrator.md)
and the recommendation docs both assume replayability.
**Recommended action**: Implement (or explicitly defer with a tracked ticket)
the replay mechanism before any system _relies_ on it for recovery.
**Owner**: Codex · **Blocker**: No · **Next step**: Roadmap P2 item.

### EA-6 — `rec.*` topics orphaned uncommitted · Severity: P2

**Evidence**: Phase 8 added six `REC_*` topic constants to `topics.ts`. Because
`topics.ts` is co-edited by Codex (it now imports `./contracts/envelope`), the
Phase 8 change was left uncommitted to avoid entangling Codex's work. The
recommendation **proto event schemas** were committed; the TS topic constants
were not.
**Recommended action**: Codex's events-package PR should absorb the `REC_*`
constants, or a `develop` integration pass should reconcile `topics.ts`.
**Owner**: Codex · **Blocker**: No · **Next step**: Track in the technical-debt
register (TD-08).

## Conclusion

The event substrate is well-engineered but **not yet coherent** — the dual topic
catalog (EA-1, P1) is the single most important integration fix in this audit.
It and the dual definition mechanism (EA-2) should be settled by **one
event-topology ADR** before further producer/consumer work, or every new event
will deepen the drift.
