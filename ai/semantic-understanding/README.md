# semantic-understanding

Multimodal embeddings. CLIP-style joint encoders for text, image, audio, and (downstream) video. The canonical embedding space for the platform.

Owner: `@next-ecosystem/ml-core`.

## What this owns
- Training the multimodal encoder family.
- Serving embeddings via Triton (text, image, audio endpoints).
- Maintaining cross-modal alignment across versions.

## Embedding dimension
1024 (CLIP-XL aligned). Locked across services so downstream consumers (`recommendation-engine`, `search-ranking`, `moderation-models`) don't have to reindex on every retrain.

## Serving
- Triton ensemble endpoints: `text@v1`, `image@v1`, `audio@v1`.
- Dynamic batching enabled (preferred batch 32, max latency 10 ms).
- Quantized FP16 weights; INT8 in canary.

## Training
- Contrastive learning on web-scale text-image pairs filtered for safety + license.
- Distillation from larger teacher models for inference efficiency.
- Eval: zero-shot classification on held-out NEXT-relevant taxonomies.

See [MODEL_CARD.md](MODEL_CARD.md) per version.
