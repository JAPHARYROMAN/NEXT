# NEXT — System Architecture

> Authoritative reference for the system shape, contracts, and operational posture of NEXT.

This document is the source of truth for *how the platform fits together*. Code documents *what* exists; ADRs document *why* particular forks were taken; this document documents the *whole*.

---

## Contents

1. [Doctrine](#1-doctrine)
2. [System layers](#2-system-layers)
3. [Topology](#3-topology)
4. [Product surfaces](#4-product-surfaces)
5. [Services](#5-services)
6. [Intelligence layer](#6-intelligence-layer)
7. [Data architecture](#7-data-architecture)
8. [Event architecture](#8-event-architecture)
9. [API architecture](#9-api-architecture)
10. [Infrastructure](#10-infrastructure)
11. [Observability](#11-observability)
12. [Security](#12-security)
13. [Performance](#13-performance)
14. [Scaling strategy](#14-scaling-strategy)
15. [Disaster recovery](#15-disaster-recovery)
16. [Engineering doctrine](#16-engineering-doctrine)

---

## 1. Doctrine

NEXT is a *living media ecosystem*. Every architectural decision is judged against these eight invariants:

1. **Modularity** — every service owns its data, contracts, and oncall rotation. No shared databases.
2. **Event-driven** — every state change emits a versioned event. The bus is the spine.
3. **AI-native** — intelligence is infrastructure, not a feature.
4. **Horizontal scale** — every component is replicable; no single-writer chokepoints in the hot path.
5. **Observable** — every request has a trace, every service has RED + USE + SLO dashboards.
6. **Resilient** — retries, circuit breakers, DLQs, and graceful degradation are defaults, not exceptions.
7. **Zero trust** — mTLS between services, OIDC at the edge, secrets only via Vault.
8. **Extensible** — what we build today must host immersive, multimodal, and agentic products we cannot yet describe.

These are non-negotiable and inherited by every subsystem in this document.

---

## 2. System layers

```
        ┌──────────────────────────────────────────────────────────────────┐
LAYER 7 │  PLANETARY EDGE              CloudFront · Anycast DNS · POPs    │
        ├──────────────────────────────────────────────────────────────────┤
LAYER 6 │  INFRASTRUCTURE              EKS · Karpenter · GPU pools · CDN  │
        ├──────────────────────────────────────────────────────────────────┤
LAYER 5 │  DATA + EVENT                Kafka · Postgres · ClickHouse ·    │
        │                              OpenSearch · Redis · Qdrant · S3   │
        ├──────────────────────────────────────────────────────────────────┤
LAYER 4 │  SOCIAL + ECONOMIC           auth · profile · community ·       │
        │                              payment · notification · moderation│
        ├──────────────────────────────────────────────────────────────────┤
LAYER 3 │  INTELLIGENCE                recommendation · search-ranking ·  │
        │                              vector · semantic · multimodal     │
        ├──────────────────────────────────────────────────────────────────┤
LAYER 2 │  APPLICATION                 media · upload · live · feed ·     │
        │                              search · analytics · event-gateway │
        ├──────────────────────────────────────────────────────────────────┤
LAYER 1 │  EXPERIENCE                  web · mobile · tv · studio ·       │
        │                              immersive · admin                  │
        └──────────────────────────────────────────────────────────────────┘
                              ▲                ▲
                              │                │
                       (api-gateway)    (edge functions)
```

Each layer talks **down** synchronously (gRPC) and emits events sideways into Kafka. Cross-layer reads bypass adjacent layers only via the api-gateway's federated GraphQL plane.

---

## 3. Topology

```
                            ┌──────────────────────┐
   Public Internet ─────────►   CloudFront + WAF   │
                            └──────────┬───────────┘
                                       │ HTTPS
                            ┌──────────▼───────────┐
                            │   api-gateway (Envoy │
                            │   + GraphQL Federation)│
                            └────┬────────────┬────┘
                          gRPC / │            │ WebSocket / HTTP
                                 ▼            ▼
       ┌──────────────────────────────────────────────────────────┐
       │                 Istio service mesh (mTLS)                │
       │                                                          │
       │  auth ─ profile ─ media ─ upload ─ live ─ feed ─ search  │
       │   │       │        │       │       │      │       │     │
       │  recommendation ─ community ─ payment ─ notification     │
       │   │                                                      │
       │  moderation ─ analytics ─ event-gateway                  │
       │                                                          │
       └──────────────┬─────────────────────┬─────────────────────┘
                      │ events              │ writes
                      ▼                     ▼
              ┌───────────────┐    ┌─────────────────┐
              │     Kafka     │    │  Postgres / RDS │
              │   (MSK, 3-AZ) │    │  Redis · CH · OS│
              └───────┬───────┘    └─────────────────┘
                      │
                      ▼
           ┌──────────────────────────┐
           │  AI / ML systems         │
           │  (Ray + Triton + vLLM)   │
           │  GPU node pool           │
           └──────────────────────────┘
```

Single AWS region for v1; the topology is region-replicable. See [§14 Scaling strategy](#14-scaling-strategy).

---

## 4. Product surfaces

NEXT presents ten products on six clients. Products are **features of one platform**, never independent apps. Identity, design system, event bus, and intelligence layer are shared.

| Client | Stack | Hosts |
| --- | --- | --- |
| `apps/web` | Next.js 15 App Router, RSC, Edge Runtime, Tailwind, Framer Motion | All products |
| `apps/mobile` | Expo + React Native, native modules for media | Video, Live, Communities, Studio (lite) |
| `apps/tv` | React + LRUD focus engine; runs on tvOS, Android TV, Tizen, WebOS | Video, Live, Sports |
| `apps/studio` | Next.js + offline-capable IndexedDB cache | Studio |
| `apps/immersive` | Three.js + WebXR | World |
| `apps/admin` | Next.js admin shell | Internal ops |

State management: server data via TanStack Query against the federated GraphQL gateway; UI state via Zustand stores scoped per surface. No global Redux.

---

## 5. Services

Fifteen services. Each is independently deployable, horizontally scalable, owns its database, and emits / consumes events on Kafka.

| Service | Language | Primary data | Reads from | Emits to |
| --- | --- | --- | --- | --- |
| `api-gateway` | Go | none | all | none |
| `event-gateway` | Go | Postgres (idempotency) | webhooks | all topics |
| `auth-service` | Go | Postgres + Redis | — | `auth.*` |
| `profile-service` | Go | Postgres | auth | `profile.*` |
| `media-service` | Go + Rust (transcoder) | Postgres + S3 | upload | `media.*` |
| `upload-service` | Go | S3 (TUS protocol) | auth | `upload.*` |
| `live-service` | Rust (ingest) + Go (control) | Redis + S3 | auth, media | `live.*` |
| `feed-service` | Go | Redis (timeline cache) | recommendation, profile | `feed.*` |
| `recommendation-service` | Go + Rust (ranker) | Qdrant + Redis | profile, media | `rec.*` |
| `search-service` | Go | OpenSearch | media, profile, community | `search.*` |
| `community-service` | Go | Postgres + Redis (presence) | profile | `community.*` |
| `payment-service` | Go | Postgres (ledger) | profile | `payment.*` |
| `notification-service` | Go | Postgres + Redis | all | `notification.*` |
| `moderation-service` | Go | Postgres + ClickHouse | all | `moderation.*` |
| `analytics-service` | Go | ClickHouse | all | none (terminal sink) |

Each service has its own README, Dockerfile, Kubernetes manifests, and proto contracts under `services/<name>/`. See per-service READMEs for internal architecture.

### Service template

Every service exposes:

| Surface | Purpose |
| --- | --- |
| `:8080/healthz` | Liveness probe |
| `:8080/readyz` | Readiness probe (dependencies healthy) |
| `:9090/metrics` | Prometheus scrape |
| gRPC on `:7070` | Internal RPC |
| GraphQL subgraph on `:8080/graphql` | Federation contribution |
| OpenTelemetry exporter → collector | Traces + metrics + logs |

---

## 6. Intelligence layer

AI is infrastructure. The intelligence layer presents three abstractions to consuming services:

1. **Embeddings API** — text, image, video, audio → vector.
2. **Retrieval API** — vector + filter → candidate set.
3. **Inference API** — task name + payload → prediction.

### Subsystems

| System | Role | Serving | Storage |
| --- | --- | --- | --- |
| `recommendation-engine` | Two-tower retrieval + cross-encoder ranker | Triton + vLLM | Qdrant + Redis feature store |
| `semantic-understanding` | Multimodal embeddings (CLIP-style) | Triton | — |
| `video-intelligence` | Shot detection, ASR, OCR, scene tags | Ray batch + Triton online | S3 artifacts |
| `multimodal-pipelines` | Joint text/vision/audio fusion | Ray | — |
| `creator-copilot` | LLM assistant (Claude / open-weight) | vLLM | — |
| `moderation-models` | Toxicity, CSAM, abuse | Triton | — |
| `search-ranking` | Learning-to-rank | Triton | OpenSearch features |
| `vector-pipelines` | Embedding generation + index maintenance | Ray | Qdrant |

GPU node pools are tainted; only AI workloads schedule onto them. See [§10 Infrastructure](#10-infrastructure).

### Training vs serving

Training jobs run on Ray clusters provisioned via [Karpenter](https://karpenter.sh) GPU node templates. Artifacts land in S3 + a model registry (MLflow). Triton + vLLM pull from the registry and hot-swap with shadow traffic before cutover.

---

## 7. Data architecture

**One database per service.** No shared schemas. Cross-service data is exchanged via events or RPC, never via the database.

| Store | Purpose | Owners |
| --- | --- | --- |
| **Postgres (RDS)** | OLTP for entities with relational integrity | auth, profile, media, community, payment, notification, moderation, event-gateway |
| **Redis (ElastiCache)** | Caches, rate-limits, session, presence, feed timeline | auth, feed, live, community, recommendation |
| **ClickHouse** | Columnar analytics; event sink | analytics, moderation |
| **OpenSearch** | Full-text search + log search | search, observability |
| **Qdrant** | Vector index (HNSW) | recommendation, search, moderation |
| **S3** | Media objects, ML artifacts, backups | media, upload, live, ai/* |

Replication: every Postgres is Multi-AZ with read replicas. ClickHouse runs 3-shard × 2-replica. OpenSearch runs 3-master + 3-data hot, plus warm tier on S3. Backups described in [§15 Disaster recovery](#15-disaster-recovery).

Schema migrations are forward-only; reversible-but-rarely. Tooling: `golang-migrate` for Go services, `alembic` for Python.

---

## 8. Event architecture

Kafka (AWS MSK, 3 brokers per AZ, KRaft) is the spine. Schemas live in [packages/events/schemas](../packages/events/schemas) and are registered with Confluent Schema Registry.

**Topic naming** — `<domain>.<entity>.<event>.v<n>`, e.g. `media.video.published.v1`.

**Schema format** — Protobuf, validated via [protovalidate](https://github.com/bufbuild/protovalidate).

**Partitioning** — by `aggregate_id` (e.g. `creator_id` for `profile.*`, `video_id` for `media.*`). Keeps per-aggregate ordering.

**Retention** — domain-specific:

| Topic family | Retention |
| --- | --- |
| `auth.*` | 7 days (PII-light, audit elsewhere) |
| `media.*`, `profile.*`, `community.*` | 30 days |
| `feed.*`, `rec.*` | 7 days |
| `analytics.*` | 90 days (then S3 cold archive) |
| `audit.*` | 7 years (compliance) |

**Failure handling** — every consumer ships with a DLQ topic `<source>.dlq` and an idempotent processor. Replay tool in [scripts/kafka-replay](../scripts/kafka-replay).

**Versioning** — additive changes are backwards-compatible; breaking changes emit a new `.v<n+1>` topic; producers dual-write during the migration window. See [docs/event-architecture.md](event-architecture.md).

---

## 9. API architecture

**External API plane** — federated GraphQL exposed by `api-gateway`. Every service contributes a subgraph; the gateway composes them via Apollo Federation 2. WebSockets for subscriptions (live chat, presence, notifications). REST endpoints exist only for webhook receivers in `event-gateway`.

**Internal API plane** — gRPC over Istio mTLS. Schemas in `proto/`. Code generated via `buf`. No internal REST.

**Rate limiting** — `api-gateway` enforces tiered token-bucket per identity (anonymous, authenticated, partner). Implemented via [Envoy local + global rate limit](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/rate_limit_filter) with Redis backing.

**Auth flow** — see [§12 Security](#12-security).

**Schema evolution** — additive. Deprecation is a tag + 90-day window + dashboards on the deprecated field's usage. Breaking changes require an ADR.

Detailed contracts in [docs/api-architecture.md](api-architecture.md).

---

## 10. Infrastructure

### Cloud

Primary: AWS. Provisioned via Terraform — see [`infrastructure/terraform`](../infrastructure/terraform). Per-environment workspaces (`dev`, `staging`, `prod`). Remote state in S3 with DynamoDB locking + KMS encryption.

### Kubernetes

- **EKS** clusters: one per environment.
- **Compute**: managed node groups for system, Karpenter-managed for workloads. Karpenter provisions x86, ARM (Graviton), and GPU (g5 / p5) on-demand.
- **Service mesh**: Istio (ambient mode). mTLS by default. AuthorizationPolicy per service.
- **Ingress**: AWS Load Balancer Controller fronts an Istio gateway; CloudFront sits in front of that.
- **GitOps**: ArgoCD with app-of-apps. Manifests in [`infrastructure/kubernetes/apps`](../infrastructure/kubernetes/apps).
- **Autoscaling**: HPA on every service against custom Prometheus metrics (latency p95, queue depth). KEDA for queue-driven workers.
- **Namespaces**: per logical domain — `next-platform`, `next-identity`, `next-media`, `next-discovery`, `next-social`, `next-payments`, `next-ml`, `next-observability`, `next-security`.

### GPU pools

Tainted node pool with `nvidia.com/gpu` resource type. Time-slicing for low-utilization inference; MIG for multi-tenant ranker / embedding services. AI pods set `nodeSelector: { workload: ai }` and request explicit GPU resources.

### CDN

CloudFront in front of S3 for media and in front of the api-gateway for HTML / API. Edge functions (CloudFront Functions + Lambda@Edge) handle auth-aware caching and A/B routing.

### Multi-region

v1 is single region (`us-east-1`). v2 adds active-active for the read path; writes route to home region per user. Region replication via Kafka MirrorMaker, Aurora Global Database, and S3 cross-region replication.

---

## 11. Observability

OpenTelemetry everywhere. The pipeline:

```
service ─OTLP─► otel-collector(agent) ─OTLP─► otel-collector(gateway)
                                                │
                            ┌───────────────────┼────────────────────┐
                            ▼                   ▼                    ▼
                       Prometheus            Tempo                  Loki
                       (metrics)             (traces)              (logs)
                            │                   │                    │
                            └───────────────────┴────────────────────┘
                                                │
                                              Grafana
                                                │
                                  Alertmanager  →  PagerDuty
```

**Dashboards** — golden signals per service (RED), USE per node, business KPIs per product, ML model health (latency, error rate, drift). Provisioned via Grafana-as-code in [`infrastructure/monitoring/grafana`](../infrastructure/monitoring/grafana).

**Alerting** — SLO-based via [Sloth](https://sloth.dev). Burn-rate alerts page on multi-window multi-burn-rate breaches; symptom-based, not cause-based.

**Tracing sampling** — head-based 1% baseline; tail-based 100% for errors and high-latency outliers via the collector.

**Logs** — structured JSON. PII fields tagged via `@next/logger` and dropped in the collector pipeline.

Full spec: [docs/observability.md](observability.md).

---

## 12. Security

Zero-trust posture:

- **Identity** — workload identity via SPIFFE / SPIRE; user identity via OAuth2 + OIDC. RS256 JWTs, 15-minute access tokens, refresh tokens rotated on use. Signing keys rotated weekly; old keys honored for one week to allow drain.
- **Network** — Istio mTLS strict mode; default-deny `NetworkPolicy` + `AuthorizationPolicy`. Public ingress only via the api-gateway behind WAF + CloudFront.
- **Secrets** — Vault is canonical. External Secrets Operator syncs to Kubernetes Secrets at runtime. No secrets in git, env files, or Terraform state.
- **Encryption** — TLS 1.3 in transit; KMS-managed CMKs at rest. Field-level encryption for PII columns via [Vault Transit](https://developer.hashicorp.com/vault/docs/secrets/transit).
- **Supply chain** — every image is signed via Cosign; SBOMs attached. Admission gated by Kyverno: no unsigned images, no `latest` tags, no privileged pods.
- **Audit** — every privileged action (impersonation, payout, moderation override) emits an `audit.*` event. Retained 7 years on ClickHouse + S3 Glacier.
- **Abuse** — rate limits at the edge; behavior models in `moderation-models`; signed device attestation for mobile.

Threat model + posture detail: [docs/security.md](security.md).

---

## 13. Performance

Target SLOs (steady state):

| Surface | SLO |
| --- | --- |
| Feed first paint (web, P75) | < 1.0 s |
| Video start (P75) | < 1.2 s |
| Live glass-to-glass | < 3.0 s |
| Search query (P95) | < 200 ms |
| Recommendation candidate gen (P95) | < 50 ms |
| Recommendation rank (P95) | < 80 ms |
| GraphQL gateway (P95) | < 150 ms |
| Event consumer lag (P99) | < 30 s |

Strategies:

- Edge caching for media + signed URLs from CloudFront.
- HTTP/3 + QUIC at the edge.
- gRPC + Protobuf internally; no JSON in the hot path.
- Connection pooling everywhere; per-service tunable.
- ANN indexes (HNSW) precomputed and pinned in memory.
- Hot timeline shards in Redis with materialized fan-out.
- Cold path served from object store with edge cache.

---

## 14. Scaling strategy

| Axis | Approach |
| --- | --- |
| **Compute** | HPA + Karpenter; KEDA for queue depth. |
| **Stateful (Postgres)** | Vertical first; shard via service split before sharding a service. |
| **Stateful (Redis)** | Cluster mode from day one; key prefix per service. |
| **Stateful (Kafka)** | Add partitions only on additive changes; consumer groups scale horizontally. |
| **Stateful (ClickHouse)** | Add shards; replicas via ZooKeeper-less keeper. |
| **Stateful (OpenSearch)** | Hot-warm-cold tiering. |
| **Stateful (Qdrant)** | Collection sharding by tenant; replication factor 2. |
| **GPU** | Karpenter GPU pools; time-slicing for inference; MIG for multi-tenancy. |
| **Region** | Active-active read path in v2; geographic write affinity. |

Full strategy in [docs/scaling-strategy.md](scaling-strategy.md).

---

## 15. Disaster recovery

Targets:

| Tier | RPO | RTO | Examples |
| --- | --- | --- | --- |
| **Tier 1** | < 1 min | < 15 min | auth, payment, media playback path |
| **Tier 2** | < 5 min | < 1 hr | upload, feed, recommendation |
| **Tier 3** | < 1 hr | < 4 hr | analytics, search rebuild |

Mechanisms:

- Postgres point-in-time recovery (35-day window) + cross-region snapshots.
- S3 versioning + cross-region replication.
- Kafka MirrorMaker to a DR region in v2.
- ArgoCD reconciles cluster state from git; cluster rebuild is a 60-minute exercise.
- Quarterly game days that fail a service, an AZ, and (in v2) a region.

Runbook: [docs/disaster-recovery.md](disaster-recovery.md).

---

## 16. Engineering doctrine

Beyond the eight invariants in [§1 Doctrine](#1-doctrine):

- **Three is a pattern, two is a coincidence.** Resist abstraction until the third caller appears.
- **Contracts before code.** New service? Proto + event schema land first.
- **Every PR ships its observability.** New endpoint without a dashboard panel + alert is incomplete.
- **Boring tech in the foundation.** Postgres, Kafka, Redis, Go. Exciting tech at the edges (vector, GPU, immersive).
- **Optimize for change.** The platform we ship in 2030 will not be the one we ship today.
- **The bus, not the database, is the integration point.** If you're tempted to read another service's database, you owe an event instead.
- **Humans over numbers.** When a metric is in tension with the principles in [SECTION 2 PHILOSOPHICAL FOUNDATION](../AGENTS.md), the principles win.
