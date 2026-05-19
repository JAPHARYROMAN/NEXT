# System layers

Visual reference for how NEXT is composed. Companion to [ARCHITECTURE.md](ARCHITECTURE.md).

## End-to-end stack

```
                              ┌────────────────┐
                              │  PLANETARY EDGE │  CloudFront · Anycast · POPs
                              └────────┬───────┘
                                       │ HTTP/3
                              ┌────────▼───────┐
                              │  WAF + Envoy    │
                              └────────┬───────┘
                                       │
                              ┌────────▼───────────┐
                              │   api-gateway       │  Apollo Router (federated GraphQL)
                              │   (next-platform)   │
                              └────────┬───────────┘
                                       │ gRPC mTLS
                ┌─────────────┬────────┴──────────┬───────────────┐
                ▼             ▼                   ▼               ▼
        ┌─────────────┐ ┌──────────────┐ ┌───────────────┐ ┌────────────┐
        │ identity    │ │ media        │ │ discovery     │ │ social     │
        │ auth        │ │ media        │ │ feed          │ │ community  │
        │ profile     │ │ upload       │ │ recommendation│ │            │
        │             │ │ live         │ │ search        │ │            │
        └──────┬──────┘ └──────┬───────┘ └───────┬───────┘ └────┬───────┘
               │               │                 │              │
               └───────┬───────┴─────────────────┴──────────────┘
                       │            │             │
                  payments   notification   trust-safety   data (analytics)
                       │            │             │              │
                       └────────────┴────┬────────┴──────────────┘
                                         │
                          ┌──────────────▼───────────────┐
                          │       Kafka (MSK 3-AZ)        │
                          └──────────────┬───────────────┘
                                         │
                ┌───────────────┬────────┴──────────┬─────────────────────┐
                ▼               ▼                   ▼                     ▼
          Postgres (RDS)    Redis (EC)        ClickHouse              S3 / Qdrant
          per service       per service       (analytics)            (objects/vectors)
```

## Inside a service pod

```
┌──────────────────────────────────────────────────────────┐
│  Pod (next-<service>)                                     │
│  ┌────────────────────────────────────────────────────┐  │
│  │  server (Go / Rust binary)                          │  │
│  │   ├─ HTTP    :8080  (chi / axum, /healthz, /readyz) │  │
│  │   ├─ gRPC    :7070  (grpc-go / tonic)               │  │
│  │   └─ Metrics :9090  (prom scrape)                   │  │
│  └────────────────────────────────────────────────────┘  │
│           │ OTLP (traces + metrics + logs)               │
│           ▼                                              │
│  ┌────────────────────────┐                              │
│  │  ztunnel (Istio ambient) │  mTLS, identity, retry, LB │
│  └────────────────────────┘                              │
└──────────────────────────────────────────────────────────┘
           │                          │
           ▼                          ▼
   otel-agent DaemonSet      Service mesh siblings
           │
           ▼
   otel-gateway → Prometheus + Tempo + Loki
```

## AI serving plane

```
                   ┌────────────────────────┐
                   │ recommendation-service │
                   └────────────┬───────────┘
                                │ gRPC
                                ▼
                  ┌──────────────────────────────┐
                  │  Triton + vLLM (next-ml ns)  │  ← GPU node pool (Karpenter)
                  │  models pulled from MLflow   │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                       Qdrant + Redis feature store
```

See ADRs:
- [Cloud](adr/0002-cloud-target.md), [K8s](adr/0011-kubernetes.md), [Mesh](adr/0003-service-mesh.md)
- [GitOps](adr/0004-gitops-argocd.md), [Languages](adr/0007-backend-languages.md)
- [API](adr/0006-api-architecture.md), [Events](adr/0008-event-bus.md)
- [Data per service](adr/0017-database-per-service.md), [Vector](adr/0005-vector-database.md)
- [Observability](adr/0009-observability.md), [Secrets](adr/0010-secrets.md), [Identity](adr/0018-workload-identity.md)
- [AI serving](adr/0016-ai-serving.md)
