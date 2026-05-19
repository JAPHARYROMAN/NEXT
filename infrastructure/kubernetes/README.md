# Kubernetes

```
kubernetes/
├── base/                 # Namespaces, cluster-wide configs (Cilium, Istio, cert-manager)
├── addons/               # Cluster addons (Karpenter, ESO, ArgoCD, kube-prometheus-stack)
├── charts/               # Helm charts authored in this repo
│   ├── next-service/     # Generic chart used by every Go service
│   └── ml-serving/       # Triton + vLLM serving template
├── apps/                 # ArgoCD Application manifests (app-of-apps)
│   ├── _root.yaml        # App-of-apps root
│   ├── auth-service/
│   ├── profile-service/
│   └── ...
└── karpenter/            # NodePool + EC2NodeClass CRDs
```

## Pattern

1. **Terraform** provisions the EKS control plane + system node group.
2. **Bootstrap** installs Karpenter, Cilium, Istio, ArgoCD via [`scripts/bootstrap-cluster.sh`](../../scripts/bootstrap-cluster.sh).
3. **ArgoCD** watches `apps/_root.yaml`, which references every service-level `Application`.
4. **Helm** charts in `charts/` template the per-service workloads. Values per environment live in `apps/<svc>/values-<env>.yaml`.
5. **Argo Rollouts** handles canary / blue-green for tier-1 services.

## Namespaces

| Namespace | Purpose |
| --- | --- |
| `next-platform` | api-gateway, event-gateway, shared platform |
| `next-identity` | auth-service, profile-service |
| `next-media` | media-service, upload-service, live-service |
| `next-discovery` | feed-service, recommendation-service, search-service |
| `next-social` | community-service |
| `next-payments` | payment-service |
| `next-messaging` | notification-service |
| `next-trust-safety` | moderation-service |
| `next-data` | analytics-service |
| `next-ml` | Triton, vLLM, Ray clusters, MLflow |
| `next-observability` | OTel collector, Prometheus, Grafana, Loki, Tempo |
| `next-security` | Vault, External Secrets, SPIRE |
| `argocd` | ArgoCD itself |
| `karpenter` | Karpenter controller |
| `istio-system` | Istio control plane |
