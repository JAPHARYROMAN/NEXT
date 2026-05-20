# Multi-Agent Drift Report

- **Phase**: 10 — System Integration Review
- **Date**: 2026-05-20
- **Auditor**: Claude (architecture governor)
- **Scope**: artifacts produced by parallel agents (Claude, Codex, Composer, Copilot) that conflict, duplicate, or diverge

## Executive summary

NEXT is built by four agents working in parallel. The model
([ADR 0033](../adr/0033-multi-agent-governance.md)) is sound, but it was
formalized **after** several phases had already run, so a measurable amount of
drift accumulated before the guardrails existed. This report catalogs it.

**The drift is concentrated, not pervasive.** Two P1 items — the **dual event
topic catalog** and the **duplicate transcoding implementation** — account for
most of the real risk. The rest is convention divergence (P2) and watch items
(P3). Naming and the app/package/service boundaries held up well.

## Findings

### DR-1 — Dual event topic catalog · Severity: P1

**Evidence**: `packages/events/src/topics.ts` carries two catalogs — Codex's
Phase-5 category streams (`CATEGORY_TOPICS`) and the legacy per-event `TOPICS`
map used by Phases 1–4. Different phases produce/consume against different
catalogs. No authority is declared.
**Recommended action**: One event-topology ADR declaring the canonical model
and the legacy migration path.
**Owner**: Claude (ADR) + Codex (events) · **Blocker**: Yes · **Next step**:
See [event-architecture-audit.md](event-architecture-audit.md) EA-1.

### DR-2 — Duplicate transcoding implementation · Severity: P1

**Evidence**: `transcoding-service` (Go, Phase 7) owns transcoding via a gRPC
job contract. `services/media-service/transcoder/` (Rust, added separately) is a
_second_ transcoding implementation — an ffmpeg worker on a **different
contract** (Kafka `media.transcode.requested.v1`), nested inside another
service's directory.
**Recommended action**: A reconciliation ADR: make `transcoding-service` the
coordinator and the Rust ffmpeg worker its worker tier (relocated out of
`media-service/`), on one contract.
**Owner**: Claude (ADR) → Codex (relocation) · **Blocker**: Yes · **Next step**:
See [runtime-boundary-audit.md](runtime-boundary-audit.md) RB-2.

### DR-3 — Three agents' work intermingled in one working tree · Severity: P1 (process)

**Evidence**: During Phase 8, the working tree on `main` held uncommitted work
from Claude (recommendation), Codex (event-bus/analytics), and Composer
(frontend) **simultaneously** — 162 mixed files. The isolation branches
(`develop`, `agent/*`) were created late, after the drift had formed.
**Recommended action**: Each agent commits its own domain to its branch; merge
to `develop`. Already partially mitigated — branches now exist and Claude's
Phase 8 + ADR work is isolated on `agent/claude-architecture`. Codex and Composer
must commit their domains to `agent/codex-backend` / `agent/composer-frontend`.
**Owner**: Codex, Composer (commit their domains) · **Blocker**: Yes — until
done, `main` does not reflect reality · **Next step**: Roadmap integration
step 0.

### DR-4 — Two event-definition mechanisms · Severity: P2

**Evidence**: Protobuf schemas (`packages/events/schemas`) vs. a Zod
contract/envelope (`packages/events/src/contracts`). Two representations of the
same contracts.
**Recommended action**: Protobuf is the source of truth ([ADR 0019](../adr/0019-schema-first.md));
the Zod envelope validates around proto-derived payloads.
**Owner**: Codex · **Blocker**: No · **Next step**: Fold into the EA-1 ADR.

### DR-5 — Hand-written event mirror packages · Severity: P2

**Evidence**: `@next/media-events` and `@next/trust-events` hand-mirror Kafka
event types that `@next/events` already owns from schemas.
**Recommended action**: Reduce the mirrors to re-exports of generated types, or
deprecate them.
**Owner**: Codex · **Blocker**: No · **Next step**: See [package-boundary-audit.md](package-boundary-audit.md) PB-3.

### DR-6 — Two Go service `internal/` layouts · Severity: P2

**Evidence**: Phase 6–8 services use `internal/{api,domain,store}`; Codex's
Phase-5 services use `internal/{api,consumer,kafka,config,events,metrics}`.
Neither matches the canonical `{api,domain,store,eventbus,consumer}`.
**Recommended action**: Ratify one canonical layout by ADR; realign lazily.
**Owner**: Claude (ADR) · **Blocker**: No · **Next step**: See [runtime-boundary-audit.md](runtime-boundary-audit.md) RB-4.

### DR-7 — Cross-encoder ranker location ambiguity · Severity: P2

**Evidence**: The Rust ranker lives in `recommendation-service/ranker/`;
`ranking-service` is an empty scaffold whose README claims to host it.
**Recommended action**: Decide the ranker's home in the reconciliation ADR.
**Owner**: Claude (ADR) · **Blocker**: No · **Next step**: See RB-3.

### DR-8 — UI package proliferation · Severity: P3

**Evidence**: Composer produced ~12 UI-layer packages with convention-only
boundaries.
**Recommended action**: Document a UI-package taxonomy. No consolidation now.
**Owner**: Claude (doc) + Composer · **Blocker**: No · **Next step**: See PB-2.

### DR-9 — `.github/instructions/` is an ungoverned set · Severity: P3

**Evidence**: `.github/instructions/` holds `copilot-execution-directive`,
`copilot-go-backend-directive` (Codex/Copilot) and `adr-governance` (Claude).
They do not conflict, but no index ties them into one coherent agent-instruction
set.
**Recommended action**: Add a short `.github/instructions/README.md` indexing
the directives and their precedence.
**Owner**: Claude · **Blocker**: No · **Next step**: Roadmap P3 item.

### DR-10 — ADR template format split · Severity: P3 (intentional)

**Evidence**: ADRs 0001–0032 use the original Nygard format; 0033+ use the
upgraded agent-readable template. This is the deliberate lazy-upgrade decision
from the ADR governance phase.
**Recommended action**: None — upgrade ADRs lazily when next edited.
**Owner**: Claude · **Blocker**: No · **Next step**: —

### DR-11 — Naming and macro-boundaries held · Severity: PASS

**Evidence**: Service directories are uniformly kebab-case; packages are
uniformly `@next/*`; the app/package/service separation was respected by every
agent. No competing design systems, no duplicate auth concepts.
**Recommended action**: None — record what worked.
**Owner**: — · **Blocker**: No · **Next step**: —

## Conclusion

Drift exists but is **contained and fixable**. Two P1 reconciliations (DR-1
event catalog, DR-2 transcoding) plus completing the branch integration (DR-3)
clear the highest risk. The remaining items are convention ADRs and watch items.
The governance model now exists to prevent recurrence — this report is the
last large drift snapshot taken _before_ the guardrails were in force.
