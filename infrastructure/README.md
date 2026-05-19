# Infrastructure

Everything that runs NEXT but isn't application code.

```
infrastructure/
├── terraform/        # AWS infra-as-code per environment
├── kubernetes/       # Helm charts, base manifests, ArgoCD apps
├── docker/           # Shared base images
├── monitoring/       # OTel, Prometheus, Grafana, Loki, Tempo
├── networking/       # Istio, ingress, DNS
├── cdn/              # CloudFront distributions
├── security/         # Vault, OPA, mTLS, RBAC
├── secrets/          # External Secrets manifests
├── github-actions/   # Reusable composite actions
└── argocd/           # GitOps app-of-apps
```

## Layers

```
   Terraform  →  AWS account state (VPC, EKS, RDS, S3, IAM, KMS)
   ArgoCD     →  cluster state (namespaces, addons, services)
   Helm       →  application bundles (per-service charts)
   CI         →  immutable image artifacts
```

Each layer commits to the next via PR. Drift between desired and actual state surfaces in Grafana ("Drift detected" panel).

See ADRs:
- [0002 Cloud target](../docs/adr/0002-cloud-target.md)
- [0011 Kubernetes](../docs/adr/0011-kubernetes.md)
- [0004 GitOps](../docs/adr/0004-gitops-argocd.md)
- [0010 Secrets](../docs/adr/0010-secrets.md)
