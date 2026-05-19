# moderation-models

Classifiers for trust + safety: toxicity, hateful content, sexual content, violence, CSAM detection, abuse / spam.

Owner: `@next-ecosystem/trust-safety` + `@next-ecosystem/ml-core` (joint).

## Models
| Model | Purpose | Serving |
| --- | --- | --- |
| `toxicity` | Per-comment / per-post text toxicity scoring | Triton (CPU + GPU canary) |
| `nsfw-image` | Image safety classifier | Triton GPU |
| `nsfw-video` | Per-shot video safety scores | Ray batch + Triton |
| `csam-fingerprint` | Hash matching against PhotoDNA / NCMEC | Custom Rust hash service (no ML — pre-shared hashes) |
| `csam-ml` | ML detection of novel CSAM (defense-in-depth) | Triton GPU, restricted access |
| `abuse-behavior` | Coordinated inauthentic behavior, harassment patterns | Batch Ray + online flag |

## Sensitivity
The CSAM models live behind elevated IAM. Training data access requires security council + legal approval. Inference outputs do not log raw content, only a stable case ID.

## Pipeline
- Triggered by `media.video.ingested.v1` and `community.post.created.v1`.
- Triton ensemble: hash → image classifier → video classifier (only if hash + image pass).
- Hits emit `moderation.flag.raised.v1` consumed by `moderation-service`.

See [MODEL_CARD.md](MODEL_CARD.md) per model.
