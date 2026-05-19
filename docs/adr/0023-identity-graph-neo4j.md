# 0023. Identity graph on Neo4j

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: @next-ecosystem/identity @next-ecosystem/data
- **Tags**: data, identity, graph

## Context

NEXT's discovery, trust, and personalization layers all need multi-hop graph queries over the social + trust + interaction edges: _"users U follows trust, weighted by recency"_, _"clusters acting in coordinated burst"_, _"shortest trust path between U and creator C"_. Postgres can model these but degrades fast on multi-hop traversals at NEXT-scale fan-out.

## Decision

`identity-graph-service` runs **Neo4j** as the canonical store for the user-centric graph. Fed entirely by Kafka events (no synchronous writes from other services). Read queries from `recommendation-service`, `search-service`, `feed-service`, `trust-service`.

## Alternatives considered

- **PostgreSQL with recursive CTEs** — works for shallow traversals; pathological at depth ≥ 3 on hot creators.
- **Amazon Neptune** — comparable graph engine, less mature open-source ecosystem.
- **DGraph** — interesting, smaller community than Neo4j; mutation semantics not as proven.
- **Roll into Qdrant + filters** — Qdrant is a vector index, not a graph engine; multi-hop traversals are out of scope.

## Consequences

### Positive

- Native graph primitives: paths, weights, centrality.
- Cypher is approachable for non-graph-specialists.
- The graph rebuilds deterministically from Kafka events — disaster recovery is replay.

### Negative

- Another stateful tier to operate. SRE on-call expands.
- Eventual consistency: graph lag behind the source of truth. Acceptable for discovery; not used for security-critical reads.
- Cost: Neo4j Enterprise (or self-host community + manage HA).

## Implementation notes

- Phase 5 scaffolds the service shell. Phase 8 stands it up against real Neo4j.
- Events consumed: `profile.follow.*`, `feed.interaction.v1`, `media.video.viewed.v1`, `community.post.created.v1`, `trust.score.updated.v1`.
- Read API: gRPC `Neighbors`, `Path`, `Centrality`, `Cluster`. GraphQL is _not_ a direct consumer — gateway calls the service.
- Operator: official Neo4j Helm chart in `infrastructure/kubernetes/charts/neo4j-values.yaml`.
