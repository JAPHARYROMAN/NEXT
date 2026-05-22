# Discovery Evolution

> How finding things on NEXT evolves — from a feed the system hands you, to a
> cultural landscape you navigate — while keeping serendipity, chaos, and the
> reachability of the smallest creators intact.

## 0. Principle

Discovery evolution is bounded by the recommendation invariants already in force
([docs/recommendation/architecture.md](../recommendation/architecture.md)): an
exploration floor, no creator monopoly, decaying interests, a reachable long
tail, breathing feeds. Every future discovery surface inherits these. Discovery
gets richer; it never gets narrower.

## 1. Current — the recommendation feed

Today (build Phase 8): a four-stage funnel, three discovery modes (Precision,
Discovery, Chaos), optimizing resonance. The feed is the primary surface — the
system assembles it and hands it to the user.

## 2. Near future (~3 years) — semantic & curiosity-driven exploration

Discovery becomes something the user can **steer**, not only receive.

- **Semantic exploration** — the user explores by meaning: "show me more like
  _this moment_", "things adjacent to this idea". Built on the deep semantic
  indexing of media ([media-evolution.md](media-evolution.md)).
- **Curiosity-driven discovery** — surfaces designed around the _expansion_ of
  interest, not the confirmation of it: explicit "take me somewhere new"
  affordances, the Chaos mode made navigable rather than implicit.
- **Multiple discovery surfaces** — the single linear feed stops being the only
  way in. Explore, semantic search, creator and community discovery, and the
  feed coexist as a set of lenses.

**Architectural implications**: discovery becomes a _set of surfaces_ over a
shared candidate/ranking substrate; semantic retrieval becomes a primary entry
point, not a recall source.

## 3. Mid term (~5 years) — creator constellations & cultural waves

Discovery becomes spatial-conceptual — a landscape with structure.

- **Creator constellations** — creators are discoverable as a _related field_:
  aesthetic neighborhoods, collaborative clusters, lineages of influence. A
  viewer can wander a constellation, not just a list.
- **Cultural-wave navigation** — the platform can surface culture _as it moves_:
  emerging aesthetics, rising scenes, the leading edge of a trend (the _origin_,
  not the 500th clone — trend-clone suppression already exists,
  [ADR 0031](../adr/0031-anti-homogenization.md)). A user can ride a wave or
  seek its source.
- **Community-mediated discovery** — communities ([community-evolution.md](community-evolution.md))
  become discovery surfaces; what a trusted community is engaging with is a
  signal a user can opt into.

## 4. Long term (~10 years) — living discovery ecosystems

Discovery becomes a **living ecosystem** rather than a delivered product:

- the discovery landscape is continuously reshaped by culture itself — scenes
  rise and fade, constellations reform, new neighborhoods of meaning appear;
- the user is a navigator with real agency — steering by curiosity, mood, depth,
  and intent — and the system is a responsive environment, not a dispenser;
- discovery, creation, and community blur: finding something, the people around
  it, and a way to participate are one continuous motion.

## 5. What is preserved at every step

These are non-negotiable across every horizon — they are why discovery evolution
is _safe_ to pursue:

- **Serendipity** — the unplanned, delightful find. The exploration floor
  guarantees capacity for it.
- **Chaos** — deliberate, quality-gated surprise. Always reachable.
- **Underground discovery** — niche scenes and subcultures stay findable; the
  long-tail recall budget is never zero.
- **Small creators** — reachable on merit; trust never becomes a ranking boost
  ([docs/trust-safety/recommendation-integration.md](../trust-safety/recommendation-integration.md)).
- **Emerging communities** — new communities are discoverable, not buried under
  incumbents.

## 6. What becomes obsolete

- **The single linear feed as the only discovery surface** — superseded by a set
  of navigable lenses.
- **"The algorithm decides, you scroll"** as the only interaction model —
  superseded by user-steered exploration.

The feed itself does **not** become obsolete — for a relaxed, lean-back user it
remains a perfectly good lens. It just stops being the _only_ one.

## 7. The risk and the guard

The risk is that richer discovery quietly re-optimizes for engagement under a
new name ([anti-patterns.md](anti-patterns.md) AP-1). The guard: every new
discovery surface is held to the **same resonance objective and the same
auto-aborting guardrails** as the feed
([docs/recommendation/experimentation.md](../recommendation/experimentation.md))
— exploration share, creator Gini, topic entropy. A discovery surface that
cannot pass those guardrails does not ship.

## 8. Future ADRs implied

- A multi-surface discovery substrate (shared candidate/ranking core, multiple
  lenses).
- A semantic-exploration interaction model.
- A cultural-wave / constellation modeling approach.

## Related documents

- [media-evolution.md](media-evolution.md) · [community-evolution.md](community-evolution.md) · [ai-evolution.md](ai-evolution.md) · [docs/recommendation/architecture.md](../recommendation/architecture.md)
