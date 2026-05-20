# NEXT — Anti-Patterns: The Failures We Refuse to Repeat

> Every platform in this category was once idealistic. They did not fail by
> accident — they failed by a sequence of locally-rational decisions that
> compounded. This document names those failure paths and ties NEXT's defense
> against each to a concrete architectural decision already in place.

This is the most important document in the roadmap. The 10-year plan is, in
large part, a plan for _not becoming this_.

## AP-1 — The attention-extraction machine

**The failure**: optimize for watch time / engagement → the model learns that
outrage, anxiety, and compulsion maximize the metric → the feed becomes a
slot machine → users feel worse and blame the platform → "enshittification".

**Why platforms fall into it**: engagement is the easiest metric to measure and
to sell to advertisers. Every short-term incentive points at it.

**How NEXT avoids it**: the recommendation engine optimizes **resonance** — a
30-day blend of satisfaction, curiosity expansion, and creator diversity — and
explicitly _not_ watch time ([docs/recommendation/ranking-system.md](../recommendation/ranking-system.md),
[ADR 0030](../adr/0030-multi-stage-ranking.md)). A high skip rate _widens_ the
feed instead of doubling down. Emotional pacing models fatigue and **calms the
feed** when a user is overstimulated rather than escalating
([docs/recommendation/fairness-systems.md](../recommendation/fairness-systems.md)).
The objective is structurally not engagement — that is the defense.

## AP-2 — Creator-economy collapse

**The failure**: creators become wholly dependent on an opaque algorithm and an
opaque monetization system → a silent ranking or payout change destroys
livelihoods overnight → creators burn out or leave → the supply side hollows.

**Why**: the platform holds all the leverage; creator dependency is profitable
until it isn't.

**How NEXT avoids it**: creator fairness is a **hard ranking constraint**, not a
courtesy — a per-creator cap, a popularity-offset bonus, a guaranteed long-tail
recall budget ([ADR 0031](../adr/0031-anti-homogenization.md)). Enforcement and
visibility changes are **disclosed, explained, and appealable** — no shadow
demonetization ([docs/trust-safety/appeals-system.md](../trust-safety/appeals-system.md)).
The creator roadmap moves creators toward **owned identity, owned community, and
portability** ([creator-economy-evolution.md](creator-economy-evolution.md)) —
reducing single-platform dependency on purpose.

## AP-3 — Cultural homogenization

**The failure**: a recommendation system optimizing any single metric converges
every feed toward the global average → niche genres die → every creator imitates
the current winning format → the platform becomes culturally flat.

**Why**: optimization _is_ convergence; without a counter-force it is inevitable.

**How NEXT avoids it**: anti-homogenization is wired into ranking — six-axis
diversity (creator, topic, aesthetic, pacing, format, exposure), an exploration
floor of ≥ 15%, trend-clone suppression, and a decaying interest graph so users
are never locked into their past ([ADR 0031](../adr/0031-anti-homogenization.md),
[ADR 0032](../adr/0032-interest-graph-decay.md)). The three discovery modes keep
Chaos — deliberate cultural surprise — always reachable.

## AP-4 — AI slop / synthetic-content overload

**The failure**: generative AI makes content infinitely cheap → the platform
floods with low-effort synthetic content → human culture drowns → discovery
becomes unusable → trust collapses.

**Why**: the platform initially benefits from volume.

**How NEXT avoids it**: AI is positioned as a **creative tool for humans**, not
a content firehose ([ai-evolution.md](ai-evolution.md)). Synthetic media is a
**disclosure** matter — declared, labeled, provenance-tracked
([docs/trust-safety/creator-authenticity.md](../trust-safety/creator-authenticity.md)).
Discovery optimizes resonance and originality, which structurally disfavors
low-effort slop. The platform never rewards volume as such.

## AP-5 — Moderation over-centralization

**The failure**: safety pressure pushes the platform toward blunt, opaque,
centralized censorship → context dies → legitimate, weird, pseudonymous, and
minority expression is suppressed → the platform becomes sterile and distrusted.

**Why**: blunt removal is cheaper and lower-risk for the platform than nuance.

**How NEXT avoids it**: the moderation pipeline prioritizes **nuance,
proportionality, and context**; cheap layers route, humans decide, ambiguity
escalates rather than defaulting to removal; over-blocking is a _tracked failure_
([docs/trust-safety/moderation-pipelines.md](../trust-safety/moderation-pipelines.md)).
There is **no shadowbanning** — every action is disclosed and appealable. Healthy
communities earn moderation **autonomy**. Pseudonymity is explicitly protected.

## AP-6 — The algorithmic class system

**The failure**: trust, verification, or reputation quietly become ranking
boosts → established creators rank higher → gain reach → gain more trust → a
permanent hierarchy forms → new creators are structurally invisible.

**Why**: boosting "trusted" content is an intuitive, easy safety story.

**How NEXT avoids it**: a hard rule — **trust gates abuse, it never boosts
rank** ([docs/trust-safety/recommendation-integration.md](../trust-safety/recommendation-integration.md)).
A guardrail metric holds `correlation(creator trust, served rank) ≈ 0`. New
accounts start at **neutral**, not zero. Verification is a fact, not a tier.

## AP-7 — Forced-metaverse futurism

**The failure**: betting the platform on immersive computing before the hardware,
the audience, and the creator tooling exist → years of investment in something
nobody uses → opportunity cost and credibility loss.

**Why**: fear of missing the "next platform" overrides evidence.

**How NEXT avoids it**: immersive is **Phase E**, explicitly **gated on real
hardware-adoption signals**, and framed as _one modality among many_ — never the
mandatory future ([immersive-computing.md](immersive-computing.md)). The roadmap
treats immersive as an expansion, not a migration.

## AP-8 — Surveillance-advertising capture

**The failure**: the business model becomes targeted advertising → the real
customer becomes the advertiser → every product decision quietly optimizes for
ad yield → user interests and platform interests diverge permanently.

**Why**: targeted advertising is the proven, easy revenue path.

**How NEXT avoids it**: the economic roadmap centers **creator-to-audience value
flow** — subscriptions, direct support, creator commerce — over surveillance
advertising ([creator-economy-evolution.md](creator-economy-evolution.md)).
Where advertising exists, it is constrained so it cannot become the master
metric. The platform's customer is the creator and the viewer, not the advertiser.

## AP-9 — Coherence collapse under scale

**The failure**: the platform grows faster than its architecture stays coherent
→ duplicated systems, runtime drift, undocumented decisions → every change gets
slower and riskier → the system becomes unevolvable.

**Why**: shipping features is visible; maintaining coherence is not.

**How NEXT avoids it**: the ADR system as binding governance; the multi-agent
governance + ownership model ([ADR 0033](../adr/0033-multi-agent-governance.md),
[ADR 0034](../adr/0034-monorepo-boundary-ownership.md)); periodic coherence
audits (the Phase 10 audit); a tracked technical-debt register. Coherence is
treated as infrastructure.

## AP-10 — Intelligence outrunning legibility

**The failure**: the platform's AI systems become so complex that no human —
including the team — can explain why the platform did what it did → accountability
becomes impossible → trust erodes → regulation arrives blunt.

**Why**: capable models are easier to deploy than to explain.

**How NEXT avoids it**: explainability is a **design requirement**, not an
add-on — every served slate carries its score breakdown, every trust score is
decomposable, every enforcement action carries a rationale. Human override is
mandatory across AI systems. Algorithmic accountability is an explicit,
continuing governance function ([platform-governance-evolution.md](platform-governance-evolution.md)).

## The pattern behind the patterns

Every failure above starts the same way: a **proxy metric** (engagement, volume,
ad yield, removal rate, "trust") quietly replaces the **real goal** (a platform
that is good for human culture). NEXT's structural defense is to (a) name the
real goal — resonance, fairness, authenticity, coherence — (b) wire it into the
architecture as constraints and guardrails, not aspirations, and (c) audit
continuously for drift. This document is the standing checklist for that audit.

## Related documents

- [10-year-ecosystem-roadmap.md](10-year-ecosystem-roadmap.md) and every domain evolution doc in this directory; the NEXT Constitution.
