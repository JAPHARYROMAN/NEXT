# Scripts

Operational scripts.

| Script | Purpose |
| --- | --- |
| [`bootstrap.sh`](bootstrap.sh) | One-shot fresh-checkout bootstrap (toolchains, deps, codegen, docker compose). |
| [`kafka-replay/`](kafka-replay) | Replay Kafka topics from an offset for new consumers / backfills. |
| [`migrate-db.sh`](migrate-db.sh) | Run service migrations (`golang-migrate` for Go, `alembic` for Python). |
| [`seed-dev.sh`](seed-dev.sh) | Seed the local dev environment with fixture data. |
| [`bootstrap-cluster.sh`](bootstrap-cluster.sh) | One-time cluster setup: ArgoCD, Karpenter, Istio, ESO. |

All scripts are idempotent.
