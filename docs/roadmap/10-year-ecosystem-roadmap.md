# NEXT — 10-Year Ecosystem Roadmap

> Where NEXT goes, and the order it gets there. This is strategic architecture,
> not a feature list — a horizon map for a platform meant to last, told in
> phases, grounded in the system that already exists.

## 0. The thesis

NEXT becomes **a discovery engine for human culture** — a place where creators
build media, communities, and worlds, and where intelligence _amplifies_ what
people make instead of flattening it into an optimized average.

The roadmap exists to keep that thesis intact under growth. Every platform in
this category has drifted: from culture toward attention extraction, from
creators toward dependency, from discovery toward homogenization. NEXT's
roadmap is, more than anything, a plan for **not drifting** — see
[anti-patterns.md](anti-patterns.md).

## 1. Three horizons

| Horizon      | NEXT becomes                                                                                                                                          | One-line test                                   |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **3 years**  | a mature human-centered media + discovery platform; creators run media businesses; interactive media begins                                           | "the best place to make and find video"         |
| **5 years**  | a creator-civilization platform; communities are living spaces; AI copilots are mature; adaptive/interactive media is mainstream                      | "creators build worlds here, not just channels" |
| **10 years** | a semantic media universe; discovery is cultural-wave navigation; immersive media is one modality among many; the ecosystem is adaptively intelligent | "intelligence amplifies culture here"           |

The horizons are directions, not deadlines. The phases below are the actual
unit of planning.

## 2. The six phases

Each phase has product goals, technical prerequisites, infrastructure
implications, organizational implications, and a primary risk. Phases overlap —
a later phase begins before an earlier one is "finished".

### Phase A — Core ecosystem foundation

_Status: largely built/designed (build Phases 1–15)._

- **Goals**: identity, the media engine (upload→transcode→playback→live),
  event-driven backbone, the recommendation funnel, trust & safety
  architecture, resilience doctrine.
- **Prerequisites**: the runtime ADRs; the monorepo; the event bus.
- **Infrastructure**: multi-region AWS, EKS, Kafka, the observability stack.
- **Organizational**: the multi-agent governance model ([ADR 0033](../adr/0033-multi-agent-governance.md)).
- **Risk**: building breadth faster than coherence — the Phase 10 audit exists
  precisely to catch this.

### Phase B — Intelligent discovery

_Status: current._

- **Goals**: the four-stage recommendation funnel in production; the three
  discovery modes; creator fairness and anti-homogenization live; trust
  integrated as an abuse filter, never a ranking boost.
- **Prerequisites**: Phase A; the embedding pipelines; ClickHouse analytics.
- **Infrastructure**: GPU inference pools; the vector store; semantic indexing.
- **Organizational**: an ML-discovery function; the experimentation discipline.
- **Risk**: discovery collapsing into engagement optimization — guarded by the
  resonance objective and the experiment guardrails.

### Phase C — Creator civilization systems

_Horizon: ~3 years._

- **Goals**: creators become media businesses — mature monetization,
  collaboration tooling, creator-owned community spaces, portable creator
  identity, AI creative copilots.
- **Prerequisites**: Phases A–B; the creator economy infrastructure
  ([creator-economy-evolution.md](creator-economy-evolution.md)).
- **Infrastructure**: economic infrastructure (payments, payouts at scale);
  collaboration backends; copilot inference.
- **Organizational**: a creator-partnerships function; creator governance.
- **Risk**: a hyper-corporate creator economy that crushes small/independent
  creators — guarded by the fairness invariants extended into monetization.

### Phase D — Interactive media systems

_Horizon: ~4–5 years._

- **Goals**: interactive and adaptive media — branching/adaptive storytelling,
  semantic video navigation, multi-perspective media, AI-assisted creation as a
  mainstream creator workflow.
- **Prerequisites**: Phase C; a richer media model than linear video;
  [media-evolution.md](media-evolution.md).
- **Infrastructure**: an interactive-media runtime; far deeper semantic indexing
  of video content.
- **Organizational**: interactive-format creator support; new content standards.
- **Risk**: premature complexity — interactive media that creators cannot
  actually make. Mitigated by creator tooling leading the format, not trailing.

### Phase E — Immersive ecosystem expansion

_Horizon: ~5–8 years._

- **Goals**: spatial and immersive media as **one modality among many** —
  immersive creator spaces, spatial gatherings — never a forced "metaverse".
- **Prerequisites**: Phase D; mature immersive hardware adoption (a gating
  external dependency); [immersive-computing.md](immersive-computing.md).
- **Infrastructure**: volumetric/spatial media delivery; spatial compute at the
  edge.
- **Organizational**: immersive creator tooling; spatial moderation.
- **Risk**: gimmick-driven futurism — entering immersive before the audience and
  hardware are real. Gated explicitly on adoption signals, not hype.

### Phase F — Adaptive semantic ecosystem

_Horizon: ~8–10 years._

- **Goals**: the platform as an adaptive semantic universe — discovery as
  cultural-wave navigation, living discovery ecosystems, creator constellations,
  intelligence woven through the experience while humans stay culturally
  central.
- **Prerequisites**: Phases A–E; deep multimodal semantic understanding.
- **Infrastructure**: semantic indexing at universe scale; redesigned discovery
  substrate ([infrastructure-evolution.md](infrastructure-evolution.md)).
- **Organizational**: ongoing algorithmic-accountability governance.
- **Risk**: the system becoming smarter than it is legible — guarded by the
  transparency and human-override doctrine in [ai-evolution.md](ai-evolution.md).

## 3. What becomes platform-defining

- **Semantic understanding of media** — the substrate for discovery, search,
  navigation, accessibility, moderation. The single most leveraged capability.
- **The trust & creator-fairness layer** — as the platform scales, _not_
  becoming a class system is the competitive moat.
- **Creator-owned identity and community** — portability and ownership become
  the reason creators stay.
- **The event-sourced, rebuildable core** — being able to replay and re-derive
  is what lets the platform evolve without rewrites.

## 4. What becomes obsolete

- **The single linear feed** as the only discovery surface — superseded by
  multi-modal exploration ([discovery-evolution.md](discovery-evolution.md)).
- **Engagement-style metrics** as anything more than diagnostics — never the
  objective; their residual use fades.
- **Per-event Kafka topics** — already superseded by category streams
  ([ADR 0036](../adr/0036-event-topology.md)).
- **The "channel" as the primary creator unit** — superseded by the creator as a
  multi-format media business + community.

## 5. Trends to embrace vs. resist

| Embrace                              | Resist                                                |
| ------------------------------------ | ----------------------------------------------------- |
| Multimodal AI as a _creative tool_   | AI-generated content _replacing_ human culture        |
| Open content provenance (C2PA-style) | Walled-garden lock-in of creators and their audiences |
| Semantic understanding of media      | Engagement-maximization / attention extraction        |
| Edge + on-device compute             | Forced "metaverse" migration                          |
| Creator ownership + portability      | Surveillance-advertising business models              |
| Adaptive, interactive formats        | Parasocial-exploitation mechanics                     |
| Regional/cultural pluralism          | Cultural homogenization by global optimization        |

## 6. Future ADRs this roadmap implies

The roadmap will require decisions worth recording as ADRs when their phase
arrives — among them: an interactive-media content model; a creator-identity
portability standard; an immersive-media delivery architecture; a copilot/AI
visibility-and-disclosure policy; an economic-infrastructure / payments
architecture; and a semantic-discovery substrate redesign. None are decided
here — this roadmap _names_ them so they are not made by accident.

## 7. How to read the rest of this directory

Each domain doc takes one slice — media, creators, discovery, AI, community,
immersive, global, governance, infrastructure — and tells its current → near →
long-term story with architectural implications. [anti-patterns.md](anti-patterns.md)
is the most important companion: it is the catalog of failures this entire
roadmap is built to avoid.

## Related documents

- [anti-patterns.md](anti-patterns.md) — the failures NEXT must not repeat
- All domain evolution docs in this directory; the NEXT Constitution; the ADR system.
