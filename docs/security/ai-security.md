# AI Security

> Securing the intelligence layer — model isolation, prompt-injection and
> poisoning defense, inference-abuse protection, and AI audit. AI is a large,
> novel attack surface; this is how NEXT contains it.

## 0. Principle

AI introduces threats classic application security does not cover: a model can
be _manipulated by its inputs_, an embedding space can be _poisoned_, an
inference endpoint can be _abused for cost or scraping_, and a recommendation
system can be _gamed_. NEXT's AI security treats **all model inputs as
untrusted** and keeps AI an isolated, observable, bounded subsystem.

Grounded in [ADR 0016](../adr/0016-ai-serving.md) and
[docs/standards/ai-system-standards.md](../standards/ai-system-standards.md).

## 1. Model & workload isolation

- AI inference and GPU workers run as **isolated, identity-bound workloads**
  ([service-authentication.md](service-authentication.md)) — least privilege,
  network-segmented, no broad production access.
- A model server's compromise is **contained** to its workload — it cannot
  pivot into the platform ([zero-trust-architecture.md](zero-trust-architecture.md)).
- GPU workloads are isolated per tenant of the platform's own use (inference vs.
  batch vs. training pools) so a fault or abuse in one does not starve another
  ([infrastructure-hardening.md](infrastructure-hardening.md)).
- AI is the **enrichment tier, never a critical-path dependency**
  ([docs/resilience/ai-resilience.md](../resilience/ai-resilience.md)) — which is
  also a security property: an AI compromise or outage cannot break auth,
  playback, or a feed.

## 2. Prompt-injection defense

For models that consume free-form input (copilots, assistants, moderation
models reading user content):

- **All model input is untrusted.** User text, content, transcripts — treated as
  adversarial by default.
- **Privilege separation** — a model has **no inherent authority**. It produces
  _suggestions and classifications_; it does not directly execute actions. An
  action a model proposes is gated by the same authorization as any other
  request ([api-security.md](api-security.md)) — a prompt that says "delete this
  account" does not delete an account, because the model cannot.
- **Instruction/data separation** — system instructions and untrusted content
  are kept structurally distinct so injected text cannot impersonate
  instructions.
- **Output validation** — a model's output is validated before use; it is never
  piped unchecked into a query, a command, or a privileged call.
- Human override is mandatory ([docs/roadmap/ai-evolution.md](../roadmap/ai-evolution.md) §5).

## 3. Embedding & semantic poisoning mitigation

The recommendation and semantic systems learn from content and behavior — an
adversary may try to **poison** them to manipulate discovery:

- **Engagement poisoning** — bot-driven fake engagement aimed at gaming the
  ranking funnel is detected and **discounted** (not punished-to-the-victim) by
  risk intelligence ([docs/trust-safety/risk-intelligence.md](../trust-safety/risk-intelligence.md) §4).
- **Embedding poisoning** — adversarial content crafted to distort an embedding
  space: mitigated by content moderation upstream, by training-data hygiene, and
  by **versioned, rebuildable embeddings** — a poisoned collection can be
  rebuilt from a clean event window ([docs/standards/ai-system-standards.md](../standards/ai-system-standards.md)).
- **Recommendation manipulation** is bounded structurally by the recommendation
  _invariants and guardrails_ ([docs/recommendation/architecture.md](../recommendation/architecture.md))
  — exploration floors, creator caps, diversity constraints cap how far any
  manipulation can move a feed.

## 4. Inference-abuse protection

AI endpoints are attractive abuse targets — cost amplification, model scraping,
prompt abuse:

- **Trust-aware rate limiting** on AI-backed endpoints — anomalous callers hit
  tighter limits ([api-security.md](api-security.md)).
- **Cost circuit breakers** — an account or pattern driving anomalous inference
  cost is throttled before it degrades capacity or budget for everyone
  ([docs/resilience/ai-resilience.md](../resilience/ai-resilience.md) §7).
- **AI quota enforcement** — per-principal inference quotas; an inference call
  is metered and bounded, not free and unbounded.
- **Anti-scraping** — bulk, automated inference patterns aimed at extracting
  model behavior are a risk signal.

## 5. Model-leakage prevention

- Model weights and artifacts are access-controlled — held in the model
  registry / object storage with least-privilege access, not freely reachable.
- Inference endpoints return **task outputs**, not internals — no raw weights,
  no training data, no system prompts echoed back.
- A model registered for production carries a model card and provenance
  ([docs/standards/ai-system-standards.md](../standards/ai-system-standards.md)) —
  an unregistered, unknown-provenance model is a supply-chain risk
  ([supply-chain-security.md](supply-chain-security.md)).

## 6. AI audit logging

- Every consequential inference — a moderation decision, a copilot action
  taken, a high-impact recommendation change — writes an **audit record**
  ([security-observability.md](security-observability.md)).
- AI outputs are **explainable** ([docs/roadmap/ai-evolution.md](../roadmap/ai-evolution.md) §5.2)
  — a recommendation slate carries its score breakdown, a moderation action a
  rationale. Explainability is a security property: it makes AI behavior
  _auditable_ and an anomaly _detectable_.
- The model version in use is recorded with its outputs — so a bad model
  version's blast radius is identifiable.

## 7. AI abuse must not amplify

A specific NEXT concern: AI must never become an **abuse amplifier** — a system
that, optimizing a metric, learns to manipulate users emotionally
([docs/roadmap/anti-patterns.md](../roadmap/anti-patterns.md) AP-1). This is held
by the recommendation _objective_ (resonance, not engagement) and its
guardrails — a structural, not incidental, defense. AI security and AI doctrine
are the same defense here.

## 8. Prohibited patterns

- ✗ A model with inherent authority to execute privileged actions.
- ✗ Treating model input as trusted.
- ✗ Piping model output unchecked into a query, command, or privileged call.
- ✗ An un-isolated, broadly-privileged inference or GPU workload.
- ✗ An unmetered, unbounded inference endpoint.
- ✗ A production model with no registry entry or provenance.
- ✗ An inference path with no audit logging or explainability.
- ✗ AI placed on a critical path such that its compromise breaks core platform
  function.

## Related

- [docs/standards/ai-system-standards.md](../standards/ai-system-standards.md) · [docs/resilience/ai-resilience.md](../resilience/ai-resilience.md) · [docs/trust-safety/risk-intelligence.md](../trust-safety/risk-intelligence.md) · [docs/roadmap/ai-evolution.md](../roadmap/ai-evolution.md) · [ADR 0016](../adr/0016-ai-serving.md)
