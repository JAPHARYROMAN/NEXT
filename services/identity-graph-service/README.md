# identity-graph-service

Affinity + trust + interaction graph over the social fabric. Backed by Neo4j per [ADR 0023](../../docs/adr/0023-identity-graph-neo4j.md).

Owner: `@next-ecosystem/identity`. Status: **scaffolded** — stood up in Phase 8 against real Neo4j.

## Public API (gRPC)

- `GraphService.Neighbors(user_id, edge_kind, depth, limit)` → ranked neighbours
- `GraphService.Path(from, to, max_hops)` → shortest path with weights
- `GraphService.Centrality(user_id)` → PageRank + clustering coefficient
- `GraphService.Affinity(user_id, topic)` → 0..1

## Events

**Consumed only** (write-side is event-fed): `profile.follow.created.v1`, `profile.follow.deleted.v1`, `feed.interaction.v1`, `media.video.viewed.v1`, `trust.score.updated.v1`.
**Emitted**: `identity_graph.edge.upserted.v1`, `identity_graph.edge.removed.v1`.

## Data

- Neo4j Causal Cluster (`identity_graph_neo4j`).
- Edge kinds: `FOLLOWS`, `INTERACTED_WITH`, `AFFINITY`, `TRUSTS`.
- Rebuildable from Kafka event topics — DR is replay.

## Consumers

- `recommendation-service` for multi-hop candidate gen.
- `search-service` for personalized rerank.
- `feed-service` for the social timeline pillar.

## SLO

- `Neighbors P95 < 80 ms` · `Edge ingestion lag P95 < 30 s` · `Availability > 99.9%`.

[Runbook](../../docs/runbooks/identity-graph-service.md) (TBD).
