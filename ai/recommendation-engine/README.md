# recommendation-engine

Two-tower retrieval (user × content) + cross-encoder reranker.

Owner: `@next-ecosystem/ml-discovery`.

## What this system owns
- Training the two-tower model on interaction logs (Ray Train, multi-node).
- Generating content embeddings (Ray Data → Triton inference → Qdrant upsert).
- Cross-encoder training for the ranker that lives in `services/recommendation-service/ranker`.
- Eval harnesses and offline replay for ranking experiments.

## What this system does NOT own
- Online serving — that's `services/recommendation-service`.
- Feature store maintenance — that's `services/recommendation-service` + Redis.

## Inference architecture
- User tower: deployed to Triton as a TorchScript model; called by `services/recommendation-service` on the request path.
- Content tower: precomputed offline; embeddings live in Qdrant.
- Ranker: ONNX + CUDA, served by the Rust `ranker` binary.

## Training pipeline
1. Daily Ray Data job materializes interaction windows from ClickHouse.
2. Ray Train multi-node trains both towers + the cross-encoder.
3. MLflow logs experiment; on metric improvement, model is tagged `staging`.
4. Shadow traffic for 24h vs production via Istio weight split (1 %).
5. Promote to `production` on win on resonance metric (long-term satisfaction proxy).

## Evaluation
- Offline: NDCG@k, MAP, AUC on held-out interactions.
- Online: A/B with multi-arm bandit; primary metric is 30-day creator diversity × satisfaction, not raw watch time.

## Model card

See [MODEL_CARD.md](MODEL_CARD.md) (added per model version; tracks training data, fairness audit, intended use).
