# NEXT Recommendation & Discovery Architecture

> The intelligence core of NEXT. This document is the load-bearing reference for
> how content finds people — and how people find weirdness, niche creators, and
> things they did not know to ask for.

## 0. Doctrine

The recommendation engine is not a watch-time optimizer. Per the NEXT
Constitution, discovery models optimize for **resonance** — long-term
satisfaction, curiosity expansion, creator diversity, cultural evolution — never
for compulsion, outrage, or infinite-scroll capture.

Five non-negotiable invariants. Every ranking change is measured against them:

1. **Exploration is preserved.** Every feed reserves capacity for content the
   model is _not_ confident about. A feed that is 100% confident is broken.
2. **No creator monopoly.** A single creator, a single community, or a single
   aesthetic cluster cannot dominate a session. Diversity is a hard constraint,
   not a tie-breaker.
3. **Interests evolve, never lock in.** The interest graph decays. A user is
   never permanently defined by last week's behavior.
4. **The long tail is reachable.** Small and emerging creators have a structural
   path to surface area that does not depend on already being popular.
5. **Feeds breathe.** Emotional pacing is modeled. The system avoids
   overstimulation, intensity monotony, and dopamine-loop mechanics.

If a metric improves engagement but violates an invariant, the change is
rejected. The invariants win.

## 1. System shape

```
        events (playback, search, follows, communities, live, skips, rewatches)
                              │
                              ▼
   ┌──────────────────────────────────────────────────────────────┐
   │  candidate-generation-service   (recall: many cheap sources)   │
   │  semantic-retrieval-service     (vector recall over Qdrant)    │
   └──────────────────────────────────────────────────────────────┘
                              │  ~1–5k candidates
                              ▼
   ┌──────────────────────────────────────────────────────────────┐
   │  ranking-service / recommendation-service                      │
   │   stage 1  lightweight ranking      (cheap, 1–5k → ~500)       │
   │   stage 2  semantic ranking         (cross-encoder, 500 → 200) │
   │   stage 3  diversity balancing      (MMR + fairness, 200 → 80) │
   │   stage 4  final rerank             (mode + pacing, 80 → N)    │
   └──────────────────────────────────────────────────────────────┘
                              │  ranked, diversified slate
                              ▼
   ┌──────────────────────────────────────────────────────────────┐
   │  feed-service        (orchestration, blending, session state) │
   │  discovery-service   (explore / chaos surfaces)               │
   │  personalization-service (interest graph, user embeddings)    │
   └──────────────────────────────────────────────────────────────┘
                              │
                              ▼
                       GraphQL gateway → clients
```

## 2. Service map

| Service                        | Language         | Owns                                                                                     |
| ------------------------------ | ---------------- | ---------------------------------------------------------------------------------------- |
| `recommendation-service`       | Go + Rust ranker | Serving orchestration; the 4-stage pipeline; discovery modes.                            |
| `feed-service`                 | Go               | Feed orchestration, candidate blending, session-aware adaptation, experiment assignment. |
| `candidate-generation-service` | Go               | The recall layer — many candidate sources blended with budgets.                          |
| `semantic-retrieval-service`   | Go               | Vector recall over Qdrant; semantic-similarity queries.                                  |
| `ranking-service`              | Go + Rust        | Multi-stage scoring; hosts the cross-encoder serving path.                               |
| `discovery-service`            | Go               | Explore / chaos surfaces, trending, niche emergence, serendipity injection.              |
| `personalization-service`      | Go               | Interest graph, user/session embeddings, exploration vectors, behavioral memory.         |

Each service owns its own datastore (ADR 0017). No shared schemas.

## 3. The four-stage pipeline

Recall is wide and cheap; ranking narrows in stages, each more expensive and more
selective than the last. Critically, **diversity and fairness are stage 3**, run
_before_ the final rerank — they shape the slate, they do not just polish it.

| Stage                | Input → output | Cost     | Job                                                 |
| -------------------- | -------------- | -------- | --------------------------------------------------- |
| Candidate generation | ∅ → 1–5k       | very low | union of recall sources, deduped                    |
| 1. Lightweight rank  | 5k → ~500      | low      | cheap scorer (logistic / GBDT on shallow features)  |
| 2. Semantic rank     | 500 → ~200     | high     | cross-encoder; relevance + novelty                  |
| 3. Diversity balance | 200 → ~80      | medium   | MMR + creator-fairness + topic/format/pacing spread |
| 4. Final rerank      | 80 → N         | low      | discovery-mode weighting + emotional pacing curve   |

See [ranking-system.md](ranking-system.md) for stage internals and
[discovery-modes.md](discovery-modes.md) for the mode model.

## 4. Candidate sources

Recall is a _union of many opinions_, each with a budget. No single source may
fill a slate. Budgets shift with discovery mode.

| Source                  | Signal                                          | Precision share | Chaos share |
| ----------------------- | ----------------------------------------------- | --------------- | ----------- |
| Collaborative filtering | co-engagement neighbors                         | high            | low         |
| Semantic retrieval      | embedding similarity to recent interests        | high            | medium      |
| Creator affinity        | creators the user follows / resonates with      | high            | low         |
| Community affinity      | communities the user is active in               | medium          | medium      |
| Trending                | velocity-ranked, regionally scoped              | medium          | medium      |
| Long-tail retrieval     | quality content with low exposure so far        | low             | high        |
| Fresh injection         | content published in the last N hours           | low             | high        |
| Serendipity             | deliberately distant from the interest centroid | low             | **high**    |

The long-tail, fresh, and serendipity sources are the structural guarantee
behind invariants 1, 4, and 5. They are never budgeted to zero.

## 5. Discovery modes

Three modes — **Precision**, **Discovery**, **Chaos** — are not user settings;
they are a continuous state the system moves through based on behavior, session
context, emotional pacing, and exploration appetite. See
[discovery-modes.md](discovery-modes.md).

## 6. Embeddings

Six embedding spaces, all multimodal-derived, all versioned. Content embeddings
come from the media AI subsystems (`semantic-indexing`, `multimodal-tagging`).
See [embedding-pipelines.md](embedding-pipelines.md).

- **content** — per-video, fused vision/audio/text.
- **creator** — aggregate of a creator's catalog + style signature.
- **user** — slow-moving taste vector; the interest centroid.
- **session** — fast-moving intent vector; resets per session.
- **community** — aggregate of a community's content + culture.
- **interest** — graph node embeddings (see §7).

User recommendations blend the **slow** user vector with the **fast** session
vector. Slow vector = who you are; fast vector = what you're doing right now.

## 7. Interest graph

Personalization is a graph, not a list of tags. Nodes are interests, creators,
communities, and aesthetic clusters; edges are weighted affinities that **decay
over time**. Decay is the mechanism behind invariant 3 — no hard lock-in, room
for reinvention. Exploration vectors point _away_ from the centroid. See
[fairness-systems.md](fairness-systems.md) §interest-graph.

## 8. Anti-homogenization

A feed degrades when it becomes repetitive, trend-cloned, or emotionally flat.
Stage 3 enforces spread across six axes — creator, topic, aesthetic, pacing,
format, and exposure — and stage 4 injects exploration. Creator-fairness scoring
prevents algorithmic lockout of small creators. See [fairness-systems.md](fairness-systems.md).

## 9. Data & vector architecture

| Store                                 | Holds                                                                            |
| ------------------------------------- | -------------------------------------------------------------------------------- |
| PostgreSQL (`recommendation`, `feed`) | recommendation metadata, served-slate log, feed sessions, experiment assignments |
| Redis                                 | low-latency feed cache, per-user feature store (1h TTL), session vectors         |
| ClickHouse                            | recommendation telemetry, ranking feature logs, diversity/fairness metrics       |
| Qdrant (vector DB)                    | content / creator / community embeddings; semantic recall                        |
| Graph (Neo4j)                         | interest graph, creator-affinity graph (shares the cluster from ADR 0023)        |

## 10. Event flow

**Consumed**: `playback.*`, `search.query.executed.v1`, `media.video.published.v1`,
`profile.follow.*`, `community.*`, `live.stream.*`, watch-completion, skip, rewatch.

**Emitted**: `rec.recommendation.served.v1`, `rec.recommendation.clicked.v1`,
`rec.recommendation.skipped.v1`, `rec.feed.generated.v1`,
`rec.discovery.mode.changed.v1`, `rec.exploration.injected.v1`.

All recommendation telemetry funnels to ClickHouse via `analytics.raw.v1`.

## 11. AI model surface

Models are trained offline, served online. See [embedding-pipelines.md](embedding-pipelines.md)
and the `/ai` subsystems: `recommendation-engine`, `embedding-pipelines`,
`ranking-models`, `discovery-models`, `feed-intelligence`, `interest-graph`,
`creator-affinity`, `semantic-clustering`.

| Model                | Kind           | Serving                                           |
| -------------------- | -------------- | ------------------------------------------------- |
| Two-tower retrieval  | retrieval      | Triton (user tower online; content tower offline) |
| Cross-encoder ranker | ranking        | Rust + ONNX + CUDA                                |
| Sequence model       | session intent | Triton, online                                    |
| Diversity policy     | RL / bandit    | online, in `ranking-service`                      |
| Pacing model         | sequence       | online, in `feed-service`                         |

## 12. Observability & experimentation

Latency, feed-diversity, creator-fairness, exploration-rate, and embedding-drift
metrics are first-class. Every ranking change ships behind an experiment with
diversity and fairness guardrail metrics that can auto-abort a rollout. See
[experimentation.md](experimentation.md).

## 13. SLOs

- Candidate generation P95 < 50 ms · Rank P95 < 80 ms · End-to-end P75 < 130 ms.
- Feed first page P75 < 200 ms.
- Exploration share of served slates ≥ 15% (guardrail — alerts if breached).
- No creator > 25% of any single session slate (hard cap).
