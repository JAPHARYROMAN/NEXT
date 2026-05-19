# 0004. GitOps via ArgoCD

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: @next-ecosystem/sre @next-ecosystem/platform
- **Tags**: infrastructure, deployment, ci-cd

## Context

We need a deployment model where the desired cluster state lives in git, drift is automatically reconciled, and rollbacks are a `git revert`. We also need a way to manage hundreds of `Application` resources across multiple clusters without bespoke scripts.

## Decision

**ArgoCD** is the GitOps engine. We use the **app-of-apps** pattern with one root `ApplicationSet` per cluster that enumerates services from a manifest in [`infrastructure/kubernetes/apps`](../../infrastructure/kubernetes).

## Alternatives considered

- **Flux CD** — equally capable; we chose ArgoCD for its UI (the Argo dashboard is genuinely useful for oncall), broader plugin ecosystem (Argo Rollouts, Argo Workflows), and team familiarity.
- **Helmfile-driven CI** — pushes from CI lose the continuous-reconciliation property and make rollback a re-run rather than a revert.
- **Spinnaker** — overkill for our team size; we'd inherit operational complexity we don't need.

## Consequences

### Positive
- Cluster state is git-observable and revertible.
- ArgoCD's `SyncWaves` and `Hooks` give us pre/post hooks for migrations and warmup.
- Argo Rollouts (separately deployed) handles canary, blue-green, and analysis-driven promotion.
- One root manifest enumerates every workload in a cluster — auditable.

### Negative
- ArgoCD itself is now a critical-tier service; needs its own SLOs.
- Helm + Kustomize via ArgoCD is a learning curve.
- The "app-of-apps" approach creates a meta-dependency graph that needs careful change management.

## Implementation notes

- One ArgoCD instance per environment cluster; cross-cluster sync via cluster secrets in the management cluster.
- Charts source-of-truth lives in [`infrastructure/kubernetes/charts`](../../infrastructure/kubernetes). Values per environment in [`infrastructure/kubernetes/apps/<service>/values-<env>.yaml`](../../infrastructure/kubernetes).
- Argo Rollouts strategy: canary with analysis against Prometheus SLO metrics for tier-1 services.
- Promotion path: `dev` (auto-sync) → `staging` (auto-sync on tag) → `prod` (manual sync with approval gate).
