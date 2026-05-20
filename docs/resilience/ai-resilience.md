# NEXT AI Workload Resilience

> AI at NEXT is **enrichment, never a dependency on the critical path**. The
> single hardest rule in this document: an AI failure must never collapse a
> feed, break playback, or block a user. AI makes NEXT smarter; its absence
> makes NEXT simpler, not broken.

## 0. Doctrine

- **AI is degradable by design.** Every AI-powered feature has a non-AI fallback
  ([graceful-degradation.md](graceful-degradation.md) §2).
- **Derived AI state is rebuildable.** Embeddings and indexes are caches over the
  event log, not systems of record.
- **GPU is scarce and bursty.** AI capacity is planned, queued, and shed
  gracefully — never assumed infinite.
- **Inference failures fail toward heuristics**, not toward errors.

## 1. The AI surface

Per [ADR 0016](../adr/0016-ai-serving.md): Triton + vLLM + Ray, on GPU node
pools managed by Karpenter ([ADR 0011](../adr/0011-kubernetes.md)).

| Component                     | Role                                                 | Criticality      |
| ----------------------------- | ---------------------------------------------------- | ---------------- |
| Inference gateway             | routes inference requests to model servers           | T2               |
| Model servers (Triton / vLLM) | ranking, embedding, moderation, understanding models | T2               |
| Vector store (Qdrant)         | semantic retrieval index                             | T2 — rebuildable |
| Embedding pipelines (Ray)     | generate embeddings from events                      | T3 — batch       |
| Training (Ray Train)          | offline model training                               | T3 — batch       |

Nothing in the AI surface is T0 or T1. That is a deliberate architectural
choice — it is what makes the doctrine's hard rule enforceable.

## 2. Model-serving failover

- Model servers run as **replicated deployments** behind the inference gateway;
  loss of a replica is absorbed by the others.
- GPU node pools span **multiple AZs**; an AZ loss removes some GPU capacity,
  not all of it.
- The inference gateway **health-checks model servers** and routes around
  unhealthy ones; a model with zero healthy servers triggers that model's
  fallback (§4) rather than erroring.
- Regional inference: where a region has no GPU pool for a given model, the
  gateway calls a peer region **within a latency budget**; if the budget is
  exceeded, it falls back locally.

## 3. GPU node recovery

- GPU nodes are expensive and supply-constrained, so the pools are tiered:
  **on-demand** for online inference (stable), **spot** for batch embedding and
  training (cheap, interruptible).
- A spot reclamation drains the node; Ray reschedules the interrupted batch
  work — batch jobs are checkpointed so they resume, not restart.
- Karpenter replaces failed GPU nodes; while replacement capacity is pending,
  the inference queue (§5) buffers and, if needed, degraded modes engage.
- GPU capacity shortfalls are a **capacity-planning** signal
  ([capacity-planning.md](capacity-planning.md)), not an incident — until they
  breach an SLO.

## 4. Degraded AI modes

Each AI feature has an ordered fallback chain. The chain is the enforcement of
the doctrine's hard rule.

| Feature                      | Full → degraded chain                                                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Recommendation ranking**   | full funnel → smaller ranker → heuristic (popularity + recency + recall priors) → cached slate → trending              |
| **Semantic search**          | hybrid lexical+vector → lexical-only → cached popular results                                                          |
| **Embeddings (online)**      | live embedding → most recent cached embedding → category/heuristic placeholder                                         |
| **Moderation AI**            | full multimodal models → smaller models → rules + hashes + human-queue weighting; **never** auto-approve to compensate |
| **Captions / understanding** | live generation → queued for later → feature quietly absent this session                                               |

Note the moderation row: when moderation AI degrades, the system gets **more
conservative and routes more to humans** — it never relaxes safety to keep
throughput. Safety degradation fails closed; experience degradation fails open.

## 5. Inference queue buffering

- Non-interactive inference (embedding generation, batch scoring,
  understanding) flows through a **queue**. A model-server slowdown grows the
  queue; it does not fail requests.
- Interactive inference (request-path ranking) has a **tight timeout** and falls
  straight to a heuristic on breach — a user never waits on a slow model.
- Queue depth is a monitored SLI; sustained growth autoscales the model pool
  and, past a threshold, engages degraded modes.

## 6. Embedding & index recovery

This is the payoff of "derived state is rebuildable":

- **Qdrant is a cache.** Its vectors are derived from content and interaction
  events. A lost Qdrant collection is **regenerated** by replaying
  `media.video.published` and the interaction streams through the embedding
  pipelines ([event-stream-resilience.md](event-stream-resilience.md) §5) — not
  restored from a backup that might be stale.
- **Versioned rebuilds** — an embedding-model change builds a _new_ collection
  by replay, dual-reads to parity, then swaps the alias. The same machinery
  recovers a lost collection.
- While an index rebuilds, semantic features run in their degraded mode (§4);
  the platform is simpler, not down.
- Snapshots still exist for _fast_ recovery; replay is the _authoritative_
  recovery.

## 7. AI abuse throttling

AI endpoints are attractive abuse targets (cost amplification, scraping, prompt
abuse). Resilience here overlaps security:

- **Trust-aware rate limiting** on AI-backed endpoints — low-trust and anomalous
  callers hit tighter limits ([docs/trust-safety/risk-intelligence.md](../trust-safety/risk-intelligence.md)).
- **Cost circuit breakers** — an account or pattern driving anomalous inference
  cost is throttled before it degrades capacity for everyone.
- AI abuse throttling sheds the _abusive_ load so legitimate inference keeps its
  capacity — a resilience mechanism, not just an anti-abuse one.

## 8. Failure modes & responses

| Failure                      | Response                                                            |
| ---------------------------- | ------------------------------------------------------------------- |
| Model-server replica down    | gateway routes to healthy replicas                                  |
| All replicas of a model down | that model's degraded mode engages (§4)                             |
| GPU node lost                | Karpenter replaces; queue buffers; batch work reschedules           |
| Spot reclamation             | checkpointed batch job resumes elsewhere                            |
| Qdrant collection lost       | regenerate by event replay; degraded semantic mode meanwhile        |
| Inference queue backing up   | autoscale model pool; engage degraded modes past threshold          |
| AI cost / abuse surge        | trust-aware throttling + cost circuit breakers                      |
| Region has no local GPU pool | cross-region inference within a latency budget, else local fallback |

## Related documents

- [graceful-degradation.md](graceful-degradation.md) · [event-stream-resilience.md](event-stream-resilience.md) · [capacity-planning.md](capacity-planning.md)
- [ADR 0016 — AI serving: Triton + vLLM + Ray](../adr/0016-ai-serving.md) · [ADR 0005 — Vector database: Qdrant](../adr/0005-vector-database.md)
