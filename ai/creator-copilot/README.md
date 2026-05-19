# creator-copilot

LLM-powered assistant for creators. Title / description / chapter generation, caption refinement, content idea brainstorming, audience Q&A drafting.

Owner: `@next-ecosystem/ml-creator`.

## Serving
- **vLLM** (per [ADR 0016](../../docs/adr/0016-ai-serving.md)) running an open-weight model (Llama 3.1-70B-Instruct default; Mistral / Qwen via canary).
- OpenAI-compatible API surfaced internally; consumed by `services/api-gateway` via a `creator-copilot` subgraph.
- Continuous batching; expected concurrency 20 / pod; ~150 tok/s sustained on g5.12xlarge.

## Retrieval-augmented
- Creator's own catalog (videos, comments, analytics) retrieved via Qdrant for grounding.
- Strict scoping: a creator's copilot only ever sees their own data + public corpus.

## Guardrails
- System prompts enforce platform policy (no medical/legal/financial advice without disclaimers).
- All outputs piped through a moderation pre-check (`moderation-models/toxicity`) before display.
- Persistent jailbreak detection — flagged sessions logged + reviewed.

## Cost
- Per-creator daily quota; over-quota requests downgraded to the smaller model.
- Inference is paid: `creator-copilot.usage.v1` events drive billing in `payment-service`.

See [MODEL_CARD.md](MODEL_CARD.md).
