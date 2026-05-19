# multimodal-pipelines

Joint text + vision + audio fusion pipelines. Reusable building blocks consumed by `recommendation-engine`, `search-ranking`, `moderation-models`.

Owner: `@next-ecosystem/ml-core`.

## Provided pipelines (Ray Data)
- `pair_construct` — text-image pairs from creator metadata.
- `triplet_construct` — text-image-audio triplets from videos.
- `dedup` — perceptual hash + embedding dedup.
- `safety_filter` — drop adult / violent / CSAM-suspect content before downstream training.

## Provided fusion modules
- Late fusion (concat + linear).
- Co-attention fusion (CLIP-style cross-attention).
- Q-Former adapters for LLM-consuming downstream tasks.

## Versioning
Pipelines pinned by hash; downstream training jobs reference an exact pipeline version + dataset snapshot for reproducibility.
