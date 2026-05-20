# AI Evolution

> How intelligence grows inside NEXT — and the doctrine that keeps it a tool in
> human hands rather than a replacement for human culture.

## 0. The non-negotiable

NEXT's AI doctrine has one fixed point: **AI amplifies human culture; it does
not replace it.** Every roadmap item below is acceptable only insofar as it
serves that. An AI capability that would flatten culture, flood the platform
with synthetic content, or quietly steer human emotion is not a roadmap item —
it is an anti-pattern ([anti-patterns.md](anti-patterns.md) AP-1, AP-4, AP-10).

## 1. Current — AI as platform intelligence

Today AI powers discovery (the recommendation funnel), semantic media
understanding, and moderation assistance. It is served on Triton + vLLM + Ray
([ADR 0016](../adr/0016-ai-serving.md)); it is resilient by being **never on the
critical path** ([docs/resilience/ai-resilience.md](../resilience/ai-resilience.md)).

## 2. Near future (~3 years) — AI as creative partner

AI moves from a platform-internal intelligence to a **visible creative partner**.

- **Creator copilots** — assistance with editing, captioning, localization,
  thumbnails, clip selection. The copilot does the mechanical; the creator keeps
  authorship.
- **Viewer assistants** — semantic navigation, "explain this", accessibility
  (live translation, description). The assistant helps a viewer _find and
  understand_, never decides for them.
- **Moderation assistance** — multimodal models that raise the floor on safety
  while humans stay authoritative ([docs/trust-safety/moderation-pipelines.md](../trust-safety/moderation-pipelines.md)).
- **Personalized discovery** — continues, always under the resonance objective
  and the anti-homogenization constraints.

## 3. Mid term (~5 years) — AI woven through the experience

AI becomes ambient — present across creation, discovery, and learning — while
remaining assistive.

- **AI-assisted creative studios** — small teams producing at studio scale
  ([creator-economy-evolution.md](creator-economy-evolution.md)).
- **AI-assisted learning** — the knowledge/education layer
  ([the education thread](#7-the-education--knowledge-thread)).
- **Adaptive experiences** — media and discovery that adapt to context, with
  creator intent and user agency as fixed points.

## 4. Long term (~10 years) — the adaptive semantic ecosystem

AI becomes the connective tissue of an adaptive semantic ecosystem (roadmap
Phase F) — deep multimodal understanding linking media, creators, communities,
and culture. The platform is intelligent throughout; humans remain culturally
central throughout. The 10-year success test: _is the platform's intelligence
making human creativity more visible, more various, and more rewarded — or
less?_

## 5. The four AI governance doctrines

These hold at every horizon. They are what make AI evolution _safe_ to pursue.

### 5.1 AI visibility

AI is **visible, not hidden**. A user can tell when AI is acting — a copilot
suggestion, an AI-generated label, an assistant answer. The platform does not
present AI output as human output, or hide AI's role in what a user sees. (This
is the user-facing complement of the synthetic-media disclosure rules in
[docs/trust-safety/creator-authenticity.md](../trust-safety/creator-authenticity.md).)

### 5.2 AI transparency

AI decisions are **explainable**. Every recommendation slate carries its score
breakdown; every trust score is decomposable; every moderation action carries a
rationale. As AI grows more capable, explainability is funded _more_, not less —
capability without legibility is [anti-patterns.md](anti-patterns.md) AP-10.

### 5.3 Human override

Every AI system is **overridable by a human**. Moderation: humans are
authoritative. Creation: the creator authors; the copilot suggests. Discovery:
the user can steer, reject, and reshape. There is no AI decision in NEXT that a
human cannot see and reverse.

### 5.4 Human centrality

AI optimizes for **human cultural flourishing**, never for its own throughput.
The platform does not reward synthetic volume; it does not let AICompose the
emotional manipulation that engagement-maximization would want
([anti-patterns.md](anti-patterns.md) AP-1). Synthetic content is welcome **as a
disclosed human creative choice** and unwelcome as a firehose.

## 6. What NEXT's AI must never do

- Replace human culture with synthetic content (AP-4).
- Homogenize culture through optimization (AP-3).
- Manipulate emotion for engagement (AP-1).
- Become so complex it is unaccountable (AP-10).
- Act invisibly or unaccountably on a user.

These are stated as prohibitions, not preferences — the same way the
recommendation invariants and the trust invariants are.

## 7. The education & knowledge thread

A specific, grounded AI opportunity: NEXT is full of explanatory and educational
media. AI-assisted learning — semantic navigation of knowledge content,
"explain this" assistants, adaptive pacing, cross-language access — can make
that media dramatically more useful, especially in NEXT's global and African
launch markets where access to learning is unevenly distributed. This is AI
amplifying culture in its clearest form: not generating the knowledge, but
_helping humans reach the knowledge other humans made_.

## 8. Future ADRs implied

- A copilot / assistant AI architecture (visibility + disclosure + override).
- An AI-governance doctrine ADR formalizing §5.
- An AI-assisted-learning subsystem design.

## Related documents

- [anti-patterns.md](anti-patterns.md) · [discovery-evolution.md](discovery-evolution.md) · [creator-economy-evolution.md](creator-economy-evolution.md) · [docs/trust-safety/creator-authenticity.md](../trust-safety/creator-authenticity.md) · [ADR 0016](../adr/0016-ai-serving.md)
