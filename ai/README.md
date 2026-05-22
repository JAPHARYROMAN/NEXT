# AI systems

Twenty-one AI/ML subsystems. Python primary; serving via Triton + vLLM + Ray (per [ADR 0016](../docs/adr/0016-ai-serving.md)).

```
ai/
├── recommendation-engine/    # Two-tower retrieval + cross-encoder ranker
├── semantic-understanding/   # Multimodal embedding (CLIP-style)
├── video-intelligence/       # Shot detection, ASR, OCR, scene tagging
├── multimodal-pipelines/     # Joint text+vision+audio fusion
├── creator-copilot/          # LLM creator assistant
├── moderation-models/        # Toxicity, CSAM, abuse classifiers
├── search-ranking/           # Learning-to-rank for search
├── vector-pipelines/         # Embedding generation + index maintenance
├── scene-detection/          # Shot + scene boundary detection
├── emotion-analysis/         # Multimodal affective signal extraction
├── speech-transcription/     # ASR, diarization, translation
├── highlight-detection/      # Highlight + key-moment scoring
├── semantic-indexing/        # Video embedding + vector index population
├── multimodal-tagging/       # Content tagging + categorization
├── embedding-pipelines/      # Recommendation embedding generation
├── ranking-models/           # Lightweight scorer + cross-encoder training
├── discovery-models/         # Discovery-mode inference + serendipity
├── feed-intelligence/        # Session-sequence + emotional-pacing models
├── interest-graph/           # Interest-graph construction + decay
├── creator-affinity/         # Creator-affinity + fairness calibration
└── semantic-clustering/      # Aesthetic/topic clustering + trend detection
```

## Common layout per system

```
ai/<system>/
├── README.md           # purpose, model card pointers, contracts
├── pyproject.toml      # uv workspace member
├── src/<pkg>/
│   ├── inference.py    # online serving handler
│   ├── pipelines/      # Ray Data pipelines
│   ├── training/       # Ray Train scripts
│   ├── evaluation/     # eval harnesses
│   └── registry.py     # MLflow integration
├── notebooks/          # exploration (not deployed)
└── configs/            # YAML configs per model version
```

## Serving topology

| Workload           | Runtime                                                     | GPU pool                                |
| ------------------ | ----------------------------------------------------------- | --------------------------------------- |
| Embedding (online) | Triton                                                      | `gpu-inference` (g5.xlarge)             |
| Ranker (online)    | Triton + custom Rust client (recommendation-service/ranker) | `gpu-inference` (g5.2xlarge)            |
| LLM (online)       | vLLM                                                        | `gpu-inference` (g5.12xlarge or A10)    |
| Batch embedding    | Ray                                                         | `gpu-batch` (g5.12xlarge, spot)         |
| Training           | Ray Train                                                   | `gpu-training` (p5.48xlarge, on-demand) |

## Model registry

[MLflow](https://mlflow.org/) self-hosted on EKS. Promotion is a tag move (`staging` → `production`). Triton model repository syncs from MLflow via S3-backed object store.

## Governance

- Every model has a **model card** in `ai/<system>/MODEL_CARD.md` documenting training data, eval metrics, fairness audit, intended use, and known failure modes.
- Sensitive models (`moderation-models/csam`) require security council sign-off before deployment.
- Per the constitution: discovery models optimize for **resonance**, never compulsion.
