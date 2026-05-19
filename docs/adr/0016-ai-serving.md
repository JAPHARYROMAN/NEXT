# 0016. AI serving: Triton + vLLM + Ray

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: @next-ecosystem/ml-platform
- **Tags**: ai, infrastructure

## Context

We serve a mix of model types — encoder embeddings (CLIP-style), cross-encoders for ranking, classifiers for moderation, and LLMs for the creator copilot. We also need a batch / pipeline runtime for embedding generation, evaluation, and offline training.

## Decision

- **NVIDIA Triton Inference Server** for traditional model serving (encoders, cross-encoders, classifiers). Multi-model + dynamic batching. ONNX, TensorRT, and PyTorch backends.
- **vLLM** for LLM serving (paged attention, continuous batching, OpenAI-compatible API).
- **Ray** for distributed training, batch inference, and pipelines (Ray Train, Ray Data, Ray Serve where it adds value).
- **MLflow** as the model registry and experiment tracker.
- All models behind a uniform Triton/vLLM gateway with OTLP-instrumented latency, GPU utilization, and per-model error rates.

## Alternatives considered

- **TorchServe** — narrower features than Triton (no shared GPU memory pool, weaker dynamic batching).
- **TGI (Text Generation Inference)** — comparable to vLLM; vLLM's continuous batching and OpenAI compatibility tip it in our favor.
- **KServe** — model-server-agnostic on top of K8s; valuable if we run heterogeneous serving frameworks; we may add it later.
- **Self-rolled FastAPI servers** — fine for prototypes; lose batching, GPU sharing, and observability primitives at scale.

## Consequences

### Positive
- Dynamic batching + shared GPU memory squeeze ~3× throughput vs naive per-model containers.
- Hot-swap of model versions via Triton model repository + shadow traffic.
- Ray gives us training, batch inference, and a path to RL/agentic workloads in one runtime.

### Negative
- Three serving / pipeline runtimes to operate. Mitigated by uniform deployment templates in [`infrastructure/kubernetes/charts/ml-serving`](../../infrastructure/kubernetes).
- LLM serving capacity planning (GPU memory, concurrency) is non-trivial; we use vLLM's metrics + KEDA scaling.

## Implementation notes

- Models published to MLflow registry with semver tags; promotion via tag move (staging → production).
- Inference pods request explicit GPU resources; Karpenter provisions from the `gpu-inference` template.
- Triton ensemble models for chained pipelines (e.g. encode → rank).
- Shadow / canary traffic via Istio routing weights between model versions.
