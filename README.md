# NEXT

> A planetary-scale, human-centered, AI-native media ecosystem.

NEXT is a creator civilization platform — video, live, communities, learning, sports, commerce, and immersive experiences unified under one identity, one design language, and one intelligence layer. This repository is the engineering foundation.

This is not a startup MVP. It is the permanent infrastructure backbone of NEXT.

---

## Table of contents

- [Ecosystem at a glance](#ecosystem-at-a-glance)
- [Repository layout](#repository-layout)
- [Quick start](#quick-start)
- [Documentation map](#documentation-map)
- [System layers](#system-layers)
- [Engineering principles](#engineering-principles)
- [Contributing](#contributing)
- [License](#license)

---

## Ecosystem at a glance

NEXT ships as a single platform composed of ten user-facing products:

| Product | Description |
| --- | --- |
| **NEXT Video** | Long- and short-form video. The cinematic core. |
| **NEXT Live** | Low-latency live streaming + interactive co-broadcasts. |
| **NEXT Studio** | Creator workstation: upload, edit, schedule, monetize. |
| **NEXT Explore** | Discovery — precision, expansion, cultural emergence. |
| **NEXT Communities** | Group spaces, presence, real-time discussion. |
| **NEXT Learn** | Structured knowledge and courses. |
| **NEXT Sports** | Live sports, highlights, fan layers. |
| **NEXT Commerce** | Creator commerce + payments. |
| **NEXT AI** | User-facing AI assistance — invisible infrastructure. |
| **NEXT World** | Spatial / immersive experiences (AR / VR / 3D). |

All products consume one identity, one event bus, one intelligence layer, one design system.

---

## Repository layout

```
.
├── apps/                    # User-facing applications
│   ├── web/                 # Next.js — primary web experience
│   ├── mobile/              # Expo + React Native
│   ├── admin/               # Internal operations console
│   ├── studio/              # Creator workstation
│   ├── tv/                  # TV / large-screen experience
│   └── immersive/           # Spatial / WebXR / Three.js
│
├── services/                # Backend microservices (Go primary, Rust for perf-critical)
│   ├── api-gateway/         # Edge ingress + GraphQL federation gateway
│   ├── event-gateway/       # External webhooks ↔ Kafka bridge
│   ├── auth-service/        # OAuth2, OIDC, session, mTLS issuance
│   ├── profile-service/     # User identity, settings, social graph
│   ├── media-service/       # Video object model, asset lifecycle
│   ├── upload-service/      # Resumable upload, chunking, virus scan
│   ├── live-service/        # Live ingest, transcode, distribution
│   ├── feed-service/        # Personalized timeline assembly
│   ├── recommendation-service/  # Candidate gen + ranking serving
│   ├── search-service/      # Search query, suggest, autocomplete
│   ├── community-service/   # Groups, presence, posts
│   ├── payment-service/     # Wallets, payouts, ledger
│   ├── notification-service/# Push, email, in-app
│   ├── moderation-service/  # Content + behavior moderation
│   └── analytics-service/   # Event ingestion → ClickHouse
│
├── ai/                      # AI / ML systems (Python primary)
│   ├── recommendation-engine/   # Two-tower retrieval + ranker training
│   ├── semantic-understanding/  # Multimodal embeddings
│   ├── video-intelligence/      # Scene detection, OCR, ASR, tagging
│   ├── multimodal-pipelines/    # Joint text/vision/audio pipelines
│   ├── creator-copilot/         # Creator-facing LLM assistance
│   ├── moderation-models/       # Toxicity, CSAM, abuse detection
│   ├── search-ranking/          # Learning-to-rank models
│   └── vector-pipelines/        # Embedding generation + indexing
│
├── packages/                # Shared libraries
│   ├── ui/                  # Headless components
│   ├── design-system/       # Tokens, themes, primitives
│   ├── config/              # Shared eslint, ts, tailwind, etc.
│   ├── types/               # Cross-cutting TS types
│   ├── events/              # Event schemas + producer/consumer SDKs
│   ├── auth-sdk/            # Client + server auth helpers
│   ├── logger/              # Structured logging
│   ├── telemetry/           # OpenTelemetry SDK wrappers
│   ├── database/            # ORM clients, migrations
│   ├── api-client/          # Generated GraphQL/gRPC clients
│   ├── feature-flags/       # OpenFeature SDK
│   ├── go/                  # Shared Go modules
│   ├── rust/                # Shared Rust crates
│   └── python/              # Shared Python packages
│
├── infrastructure/          # Everything that's not application code
│   ├── terraform/           # AWS infra-as-code (EKS, RDS, MSK, S3, CF)
│   ├── kubernetes/          # Helm charts, base manifests, kustomize
│   ├── docker/              # Base images + buildx config
│   ├── monitoring/          # Prometheus, Grafana, Loki, Tempo
│   ├── networking/          # Istio, ingress, DNS
│   ├── cdn/                 # CloudFront + edge configs
│   ├── security/            # Vault, OPA, mTLS, RBAC
│   ├── secrets/             # External Secrets, sealed secrets
│   ├── github-actions/      # Reusable workflows
│   └── argocd/              # App-of-apps GitOps
│
├── proto/                   # Cross-service protobuf definitions
├── docs/                    # Architecture docs, ADRs, runbooks
├── tooling/                 # Codegen + repo tooling
├── scripts/                 # Operational scripts (bootstrap, seed, migrate)
├── tests/                   # E2E + load tests (k6, Playwright)
└── config/                  # Environment templates
```

For a complete architecture deep-dive see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Quick start

### Prerequisites

NEXT is a **polyglot monorepo**. Toolchain versions are pinned in [.mise.toml](.mise.toml) — install [mise](https://mise.jdx.dev) and everything else follows.

```bash
# Install mise (one time)
curl https://mise.run | sh

# Install all toolchains pinned by this repo
mise install
```

You'll get Node 22, pnpm 9, Go 1.23, Rust 1.82, Python 3.12, uv, Terraform 1.9, kubectl, Helm, ArgoCD CLI, buf, protoc, and go-task.

### Bootstrap

```bash
# Install all deps across JS, Go, Rust, Python
task bootstrap

# Generate protobuf + GraphQL client code
task codegen
```

### Local development

```bash
# Boot local dependencies (postgres, redis, kafka, otel collector, grafana)
task dev:up

# Start every dev server (turbo runs them in parallel)
pnpm dev

# Tail local infra logs
task dev:logs

# Tear down
task dev:down
```

A local Grafana is then reachable at <http://localhost:3001> with dashboards pre-loaded from [infrastructure/monitoring/grafana](infrastructure/monitoring/grafana).

### Running tests

```bash
task test          # all languages
task test:ts       # JS / TS only
task test:go       # Go only
task test:rust     # Rust only
task test:python   # Python only
```

### Common workflows

```bash
task lint          # lint everything
task build         # build everything
task tf:plan ENV=staging   # Terraform plan for staging
task k8s:context ENV=staging  # switch kubectl context
```

See [docs/onboarding.md](docs/onboarding.md) for the full new-engineer walkthrough.

---

## Documentation map

| Document | Purpose |
| --- | --- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | End-to-end system architecture |
| [docs/adr/](docs/adr/) | Architecture Decision Records (decisions + rationale) |
| [docs/system-layers.md](docs/system-layers.md) | Layered architecture map |
| [docs/api-architecture.md](docs/api-architecture.md) | GraphQL federation + gRPC strategy |
| [docs/event-architecture.md](docs/event-architecture.md) | Kafka topology, schemas, replay |
| [docs/database-architecture.md](docs/database-architecture.md) | Per-service data ownership |
| [docs/security.md](docs/security.md) | Zero-trust posture, secrets, IAM |
| [docs/scaling-strategy.md](docs/scaling-strategy.md) | Horizontal + regional scaling |
| [docs/disaster-recovery.md](docs/disaster-recovery.md) | RTO / RPO, failover, backups |
| [docs/production-deployment.md](docs/production-deployment.md) | Release + rollback |
| [docs/runbooks/](docs/runbooks/) | Oncall procedures |
| [docs/onboarding.md](docs/onboarding.md) | New engineer setup |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Conventions, PR flow, commit format |
| [SECURITY.md](SECURITY.md) | Vulnerability disclosure |
| [GOVERNANCE.md](GOVERNANCE.md) | Decision-making model |

---

## System layers

```
┌───────────────────────────────────────────────────────┐
│ EXPERIENCE      Web · Mobile · TV · Studio · Spatial  │
├───────────────────────────────────────────────────────┤
│ APPLICATION    Video · Live · Communities · Commerce  │
├───────────────────────────────────────────────────────┤
│ INTELLIGENCE    Recommendation · Semantics · Ranking  │
├───────────────────────────────────────────────────────┤
│ SOCIAL+ECON    Identity · Communities · Payments      │
├───────────────────────────────────────────────────────┤
│ DATA+EVENT     Kafka · ClickHouse · Vector · OpenSearch│
├───────────────────────────────────────────────────────┤
│ INFRA          Kubernetes · GPUs · CDN · Storage      │
├───────────────────────────────────────────────────────┤
│ PLANETARY EDGE  Multi-region intelligent delivery     │
└───────────────────────────────────────────────────────┘
```

Full diagrams in [docs/system-layers.md](docs/system-layers.md).

---

## Engineering principles

1. **Modular** — every service owns its data and contracts; nothing is shared at the database layer.
2. **Event-driven** — every state change emits a versioned event onto Kafka.
3. **AI-native** — intelligence ships from day one as invisible infrastructure, not bolted on.
4. **Observable** — every request carries a trace; every service exposes RED metrics; every log is structured.
5. **Resilient** — retries, circuit breakers, dead-letter queues, graceful degradation by default.
6. **Secure by default** — zero-trust networking, mTLS between services, secrets only via Vault.
7. **Extensible** — designed today to host the multimodal, spatial, and autonomous-agent products of tomorrow.
8. **Humane** — discovery optimizes for resonance and emergence, never for compulsion.

Full doctrine in [docs/ARCHITECTURE.md#engineering-doctrine](docs/ARCHITECTURE.md#engineering-doctrine).

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Highlights:

- Conventional Commits enforced via commitlint
- Pre-commit runs lint-staged via husky
- All PRs require two reviews; one must be from `CODEOWNERS`
- Architecture-affecting PRs require an ADR in [docs/adr/](docs/adr/)
- Squash merges only

---

## License

Apache 2.0 — see [LICENSE](LICENSE).
