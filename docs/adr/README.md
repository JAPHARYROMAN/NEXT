# Architecture Decision Records

ADRs are the **institutional memory of NEXT**. They capture load-bearing
architectural decisions — context, alternatives, the call we made, the
consequences we accepted — so the system stays coherent as it grows and as four
AI agents build it in parallel.

This is governance infrastructure, not documentation decoration. **Accepted
ADRs are binding** on every contributor, human or agent.

## What an ADR is

An ADR records one architectural decision. It is created when a decision is
significant, hard to reverse, and affects more than one service or team. It is
never deleted — a decision that no longer holds is _superseded_ by a new ADR, so
the history of why the system is shaped the way it is stays intact.

## When an ADR is required

| Change                                          | ADR required?               |
| ----------------------------------------------- | --------------------------- |
| New runtime or language for a tier              | **Yes**                     |
| New datastore, cache, or warehouse              | **Yes**                     |
| New event-contract pattern or messaging system  | **Yes**                     |
| New infrastructure component                    | **Yes**                     |
| Changing or reversing a prior decision          | **Yes** — a superseding ADR |
| A new service that follows existing patterns    | No                          |
| Bug fix, refactor, test, or doc within a domain | No                          |

If you are unsure, it needs an ADR. Cheap to write, expensive to omit.

## How to create one

1. Copy [`template.md`](template.md) to `NNNN-short-slug.md` using the next
   unused number (see numbering rules below).
2. Fill **every** section — including _Implementation rules_, _Agent
   instructions_, and _Review triggers_. An ADR without enforceable rules and a
   review trigger is not finished.
3. Open a docs-only PR with `Status: Proposed`.
4. Discuss in the PR. On consensus, set `Status: Accepted`, add a row to the
   index below, and merge.
5. An ADR that supersedes another sets the old one's status to
   `Superseded by NNNN` and links it.

## Numbering rules

- ADRs are numbered sequentially from `0001`, four digits, **never reused**.
- The next ADR takes the next unused number — currently **0040**.
- A number, once assigned, is permanent even if the ADR is later superseded or
  deprecated. Numbers are identity, not ordering of importance.

## Status lifecycle

```
Proposed ──▶ Accepted ──▶ Superseded by NNNN
                  │
                  └─────▶ Deprecated
```

- **Proposed** — under discussion in a PR. Not yet binding.
- **Accepted** — binding. All contributors must comply.
- **Superseded by NNNN** — replaced by a newer decision; kept for history.
- **Deprecated** — no longer relevant and not replaced (e.g. the component was
  removed); kept for history.

## Ownership

The ADR system is owned by **Architecture (Claude)** per
[ADR 0033](0033-multi-agent-governance.md). Each individual ADR also names the
roles accountable for _its_ decision in the `Owners` field. Directory ownership
across the monorepo is defined by [ADR 0034](0034-monorepo-boundary-ownership.md).

## Agent rules

Every AI agent must, per
[adr-governance.instructions.md](../../.github/instructions/adr-governance.instructions.md):

1. Check the relevant ADRs before changing architecture.
2. Create a new ADR for any major runtime / datastore / event / infra decision.
3. Never violate an Accepted ADR — propose a superseding ADR instead.
4. Escalate conflicts instead of guessing.
5. Preserve ownership boundaries.

## Format

ADRs from `0033` onward use the upgraded [`template.md`](template.md), which
adds agent-readable sections — _Implementation rules_, _Agent instructions_,
_Review triggers_ — to the classic
[Michael Nygard structure](https://github.com/joelparkerhenderson/architecture-decision-record/blob/main/locales/en/templates/decision-record-template-by-michael-nygard/index.md):
Context · Decision · Alternatives · Consequences. ADRs `0001`–`0032` use the
original format and are upgraded lazily when next substantively edited.

## Foundational decision map

The runtime and platform decisions that everything else rests on. Use this to
find the ADR that governs an area before you change it.

| Decision                                            | ADR                                                                                                                                                   |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend runtime = **Go**                            | [0007](0007-backend-languages.md)                                                                                                                     |
| Frontend runtime = **TypeScript + React / Next.js** | [0014](0014-frontend.md)                                                                                                                              |
| AI runtime = **Python**                             | [0016](0016-ai-serving.md), [0007](0007-backend-languages.md)                                                                                         |
| Event-driven architecture = **Kafka**               | [0008](0008-event-bus.md), [0019](0019-schema-first.md), [0036](0036-event-topology.md), [0039](0039-event-schema-source-of-truth.md)                 |
| Media storage = **object storage, tiered**          | [0026](0026-storage-tiering.md), [0027](0027-signed-playback-urls.md)                                                                                 |
| Analytics warehouse = **ClickHouse**                | [0035](0035-clickhouse-analytics-warehouse.md)                                                                                                        |
| Observability = **OpenTelemetry**                   | [0009](0009-observability.md)                                                                                                                         |
| Recommendation = **Precision · Discovery · Chaos**  | [0029](0029-three-discovery-modes.md), [0030](0030-multi-stage-ranking.md), [0031](0031-anti-homogenization.md), [0032](0032-interest-graph-decay.md) |
| Database isolation = **one per service**            | [0017](0017-database-per-service.md)                                                                                                                  |
| Go service layout = **coordinator + perf worker**   | [0037](0037-compute-coordinator-worker-split.md), [0038](0038-canonical-go-service-layout.md)                                                         |
| Multi-agent governance                              | [0033](0033-multi-agent-governance.md)                                                                                                                |
| Monorepo boundary ownership                         | [0034](0034-monorepo-boundary-ownership.md)                                                                                                           |

## Index

| #    | Title                                                                             | Status   |
| ---- | --------------------------------------------------------------------------------- | -------- |
| 0001 | [Monorepo with Turborepo + pnpm](0001-monorepo-tooling.md)                        | Accepted |
| 0002 | [AWS as primary cloud](0002-cloud-target.md)                                      | Accepted |
| 0003 | [Service mesh: Istio (ambient mode)](0003-service-mesh.md)                        | Accepted |
| 0004 | [GitOps via ArgoCD](0004-gitops-argocd.md)                                        | Accepted |
| 0005 | [Vector database: Qdrant](0005-vector-database.md)                                | Accepted |
| 0006 | [API plane: GraphQL Federation + gRPC](0006-api-architecture.md)                  | Accepted |
| 0007 | [Backend languages: Go primary, Rust perf-critical](0007-backend-languages.md)    | Accepted |
| 0008 | [Event bus: Kafka via MSK](0008-event-bus.md)                                     | Accepted |
| 0009 | [Observability: OpenTelemetry + Prometheus + Tempo + Loki](0009-observability.md) | Accepted |
| 0010 | [Secret management: Vault + External Secrets](0010-secrets.md)                    | Accepted |
| 0011 | [Kubernetes: EKS + Karpenter](0011-kubernetes.md)                                 | Accepted |
| 0012 | [Authentication: OAuth2 + OIDC + RS256 JWTs](0012-authentication.md)              | Accepted |
| 0013 | [Feature flags: OpenFeature + GrowthBook self-hosted](0013-feature-flags.md)      | Accepted |
| 0014 | [Frontend: Next.js App Router + RSC + Edge](0014-frontend.md)                     | Accepted |
| 0015 | [Mobile: Expo + React Native](0015-mobile.md)                                     | Accepted |
| 0016 | [AI serving: Triton + vLLM + Ray](0016-ai-serving.md)                             | Accepted |
| 0017 | [Database per service; no shared schemas](0017-database-per-service.md)           | Accepted |
| 0018 | [Workload identity: SPIFFE / SPIRE](0018-workload-identity.md)                    | Accepted |
| 0019 | [Schema-first via Protobuf + Buf](0019-schema-first.md)                           | Accepted |
| 0020 | [Polyglot toolchain managed by mise](0020-toolchain-mise.md)                      | Accepted |
| 0021 | [session-service split from auth-service](0021-session-service-split.md)          | Accepted |
| 0022 | [Access control via Rego policy bundles](0022-access-control-rego.md)             | Accepted |
| 0023 | [Identity graph on Neo4j](0023-identity-graph-neo4j.md)                           | Accepted |
| 0024 | [Trust score is event-driven](0024-trust-score-event-driven.md)                   | Accepted |
| 0025 | [Content-adaptive transcoding ladder](0025-transcoding-ladder.md)                 | Accepted |
| 0026 | [Media storage tiering; immutable masters](0026-storage-tiering.md)               | Accepted |
| 0027 | [Signed short-TTL playback URLs](0027-signed-playback-urls.md)                    | Accepted |
| 0028 | [Media pipeline orchestrator saga](0028-media-pipeline-orchestrator.md)           | Accepted |
| 0029 | [Three continuous discovery modes](0029-three-discovery-modes.md)                 | Accepted |
| 0030 | [Multi-stage ranking with diversity balancing](0030-multi-stage-ranking.md)       | Accepted |
| 0031 | [Anti-homogenization & creator fairness](0031-anti-homogenization.md)             | Accepted |
| 0032 | [Interest graph with affinity decay](0032-interest-graph-decay.md)                | Accepted |
| 0033 | [Multi-agent governance model](0033-multi-agent-governance.md)                    | Accepted |
| 0034 | [Monorepo boundary ownership](0034-monorepo-boundary-ownership.md)                | Accepted |
| 0035 | [ClickHouse as the analytics warehouse](0035-clickhouse-analytics-warehouse.md)   | Accepted |
| 0036 | [Event topology: category streams](0036-event-topology.md)                        | Accepted |
| 0037 | [Compute coordinator + worker split](0037-compute-coordinator-worker-split.md)    | Accepted |
| 0038 | [Canonical Go service layout](0038-canonical-go-service-layout.md)                | Accepted |
| 0039 | [Protobuf event-definition source of truth](0039-event-schema-source-of-truth.md) | Accepted |
