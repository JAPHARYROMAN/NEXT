# AI System Standards

> The enforceable standard for every subsystem under `/ai`. Its job: keep AI
> Python-first, observable, contract-bounded, and an _enrichment_ tier that can
> never sit on a critical path.

Status: **binding**. Grounded in [ADR 0016](../adr/0016-ai-serving.md) (Triton +
vLLM + Ray) and [ADR 0005](../adr/0005-vector-database.md) (Qdrant).

## 1. Python-first doctrine

- `/ai/*` subsystems are **Python**. No other AI runtime without an ADR
  ([runtime governance](../governance/runtime-governance.md)).
- Layout: a `pyproject.toml` (a `uv` workspace member) + `src/<package>/`.
- **No AI training logic in a Go service.** A Go service may _call_ AI
  inference; it never embeds training or pipeline logic.

## 2. The inference boundary

- AI is consumed by services as a **contract** — an inference endpoint (Triton /
  vLLM) or a typed client — never as an imported library inside a Go service.
- Online inference is served by Triton/vLLM ([ADR 0016](../adr/0016-ai-serving.md));
  batch pipelines run on Ray.
- **AI is the enrichment tier — never a critical-path dependency.** A Go
  service's core function MUST work when AI is unavailable
  ([docs/resilience/ai-resilience.md](../resilience/ai-resilience.md)): inference
  calls have a timeout and a non-AI fallback.

## 3. Model registry standards

- Every served model is registered in **MLflow** with a version and a model
  card (training data, eval metrics, fairness audit, intended use, known failure
  modes).
- Promotion (`staging` → `production`) is a **tag move**, reviewed — never an
  ad-hoc deploy.
- A model serving production traffic with no registry entry and no model card is
  a standards violation.

## 4. Embedding pipeline standards

- Embeddings are **derived and rebuildable** from the event log — never a
  system of record ([docs/resilience/ai-resilience.md](../resilience/ai-resilience.md)).
- One owning subsystem per embedding space (content, creator, user, …). **No
  duplicated embedding pipelines** — if two subsystems need the same embedding,
  one owns it and the other consumes it.
- Every embedding space is **versioned**; a model bump writes a new vector
  collection, dual-reads to parity, then atomically swaps the alias.

## 5. Vector retrieval standards

- Vector storage and retrieval go through Qdrant ([ADR 0005](../adr/0005-vector-database.md)),
  accessed via the designated retrieval service — subsystems do not each open
  their own Qdrant client patterns.
- A collection has an explicit lifecycle: created → dual-read → alias-swapped →
  old collection retired ([database-standards.md](database-standards.md)).
- Retrieval has a **lexical / heuristic fallback** for when the vector path is
  degraded.

## 6. GPU orchestration rules

- GPU node pools are Karpenter-managed ([ADR 0011](../adr/0011-kubernetes.md)):
  **on-demand** for online inference, **spot** for batch (training, embedding).
- Batch jobs are **checkpointed** so a spot reclamation resumes, not restarts.
- GPU is a planned, forecast resource ([docs/resilience/capacity-planning.md](../resilience/capacity-planning.md))
  — not assumed infinite.

## 7. Observability minimums

Every AI subsystem and inference endpoint **MUST** emit
([observability-standards.md](observability-standards.md)): inference latency
and throughput, error rate, queue depth (for queued inference), model version
in use, and — for models with quality guardrails — the guardrail metrics
(e.g. recommendation exploration share, moderation false-positive rate). **No
unobservable inference** — an inference path with no telemetry is a violation.

## 8. AI governance alignment

AI subsystems obey the AI governance doctrine
([docs/roadmap/ai-evolution.md](../roadmap/ai-evolution.md) §5): visibility,
transparency (explainable outputs — e.g. served slates carry a score
breakdown), human override, human centrality. Moderation AI fails _closed_
(more conservative, more human review); experience AI fails _open_ (degrade the
feature) — see [docs/resilience/ai-resilience.md](../resilience/ai-resilience.md).

## 9. Prohibited patterns

- ✗ Training or pipeline logic inside a Go service.
- ✗ An AI runtime other than Python without an ADR.
- ✗ A "toy wrapper" presented as production — a thin call to an external model
  with no registry entry, no model card, no observability, no fallback.
- ✗ A hidden model dependency — a model used in production that is not
  registered and versioned.
- ✗ Duplicated embedding pipelines for the same space.
- ✗ An inference path with no telemetry.
- ✗ AI placed on a critical path such that its failure breaks playback, a feed,
  or auth.

## Related

- [ADR 0016](../adr/0016-ai-serving.md) · [docs/resilience/ai-resilience.md](../resilience/ai-resilience.md) · [observability-standards.md](observability-standards.md) · [database-standards.md](database-standards.md)
