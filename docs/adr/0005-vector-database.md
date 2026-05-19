# 0005. Vector database: Qdrant

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: @next-ecosystem/ml-platform @next-ecosystem/ml-discovery
- **Tags**: ai, data, infrastructure

## Context

Recommendation, search, semantic understanding, and moderation all need approximate-nearest-neighbor (ANN) retrieval over multimodal embeddings (~1024-dim) at billions-of-vectors scale, with sub-50 ms P95 retrieval latency, filtered search, and online upserts.

## Decision

**Qdrant** is the canonical vector database. Self-hosted on EKS via the official Qdrant operator. HNSW index per collection; shard by tenant or content type; replication factor 2.

## Alternatives considered

- **Pinecone** — managed, performant, but a per-vector cost model at our scale becomes prohibitive, and operating outside our VPC adds egress and latency.
- **Weaviate** — good multimodal story; we found Qdrant's filter performance and operational ergonomics better at our target scale.
- **Milvus** — capable, but operationally heavier (etcd + Pulsar + multiple components) than Qdrant.
- **pgvector** — fine for small-scale RAG, not a primary discovery store at our scale. We use it inside individual services for small embedding sets.
- **OpenSearch k-NN** — co-located with our search infra and a strong fit for hybrid search; we will use it *additionally* in the search-ranking path, but not as the primary vector store.

## Consequences

### Positive
- Self-hosted: no per-vector cost; operational economics are CPU + RAM + disk.
- Strong filter performance on payload fields (a hard requirement for personalization filters).
- Online upsert with HNSW; no offline rebuilds in the hot path.
- Operator-managed scaling and replication on Kubernetes.

### Negative
- Operational responsibility: we are now running a stateful database. SRE adds Qdrant to the on-call surface.
- HNSW memory footprint is real; large collections require careful sharding and memory sizing.
- The ecosystem (client libraries, query tooling) is younger than for OpenSearch or pgvector.

## Implementation notes

- Collections per content domain: `videos`, `creators`, `communities`, `posts`, `moderation-fp`.
- Embedding dimension: 1024 (CLIP-XL aligned). Aligned across services.
- Hybrid retrieval: Qdrant for vector recall, then re-rank via cross-encoder in `recommendation-service/ranker` (Rust).
- Backup: snapshot to S3 every 6 hours; restore tested quarterly.
