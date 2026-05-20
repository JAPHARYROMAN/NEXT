# Architecture Decision Records

ADRs capture **load-bearing** architectural decisions: their context, the alternatives considered, the call we made, and the consequences we accepted.

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

## Process

1. Copy [template.md](template.md) to `NNNN-short-slug.md` using the next unused number.
2. Open a docs-only PR with status `Proposed`.
3. Discuss in PR. When consensus reached, update status to `Accepted` and merge.
4. Future ADRs that supersede this one set its status to `Superseded by NNNN`.

## Format

Each ADR follows [Michael Nygard's template](https://github.com/joelparkerhenderson/architecture-decision-record/blob/main/locales/en/templates/decision-record-template-by-michael-nygard/index.md):

- **Context** — what is going on; what constraints apply
- **Decision** — what we chose
- **Alternatives** — what we rejected and why
- **Consequences** — what we accept (good and bad)
