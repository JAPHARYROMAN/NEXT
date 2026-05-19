# 0011. Kubernetes: EKS + Karpenter

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: @next-ecosystem/sre
- **Tags**: infrastructure, kubernetes

## Context

We need a Kubernetes control plane that we don't operate, paired with a workload-aware autoscaler that can provision the right instance type (x86, Graviton, GPU) for each workload in seconds, not minutes.

## Decision

- **EKS** for the Kubernetes control plane.
- **Karpenter** for node autoscaling (replaces Cluster Autoscaler).
- **Managed node groups** for the system / addons baseline (CoreDNS, ingress, metrics-server).
- **Cilium** as the CNI.
- Per-environment cluster: `next-dev`, `next-staging`, `next-prod-us-east-1`.

## Alternatives considered

- **Self-hosted Kubernetes** — rejected: control-plane operation isn't a competitive advantage.
- **GKE / AKS** — strong products, but we already chose AWS in [ADR 0002](0002-cloud-target.md).
- **Cluster Autoscaler** — works, but pre-defining node groups for every workload mix is rigid. Karpenter binpacks workloads onto right-sized nodes directly.
- **Fargate** — pricing and integration limits (no DaemonSets, GPU not supported) make it a poor fit for the bulk of our workloads.

## Consequences

### Positive
- Control plane operated by AWS, including patching.
- Karpenter provisions nodes in ~30 s, picks Graviton when applicable for ~20 % cost savings.
- GPU node templates ready for AI workloads with proper taints and tolerations.
- Cilium gives us strong network policy + identity-aware enforcement underneath Istio.

### Negative
- EKS pricing per cluster is non-trivial; we keep cluster count low by sharing per environment.
- Karpenter's instance flexibility means observability of "what just got provisioned" matters; we surface this in Grafana.
- Multi-region in v2 means multiple EKS clusters; cluster fleet management gets real.

## Implementation notes

- Node templates: `system`, `general`, `general-graviton`, `gpu-inference`, `gpu-training`, `memory-optimized`.
- Workload labels: `workload.next.io/class={system,general,ai,memory}`; Karpenter consolidation enabled.
- Addons via EKS Addons + ArgoCD apps: AWS Load Balancer Controller, EBS CSI, EFS CSI, External Secrets, Cilium, Istio ambient, cert-manager, Karpenter, kube-prometheus-stack, Tempo, Loki, ArgoCD itself bootstrapped via Terraform.
