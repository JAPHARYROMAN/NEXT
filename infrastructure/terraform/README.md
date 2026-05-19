# Terraform — AWS infrastructure

```
terraform/
├── modules/                # reusable composable modules
│   ├── vpc/
│   ├── eks/
│   ├── rds-postgres/
│   ├── elasticache-redis/
│   ├── msk-kafka/
│   ├── s3-bucket/
│   ├── cloudfront/
│   ├── opensearch/
│   ├── iam-irsa/
│   ├── kms-key/
│   └── route53-zone/
├── environments/           # per-env composition + backend
│   ├── dev/
│   ├── staging/
│   └── prod/
└── shared/                 # cross-env (Route 53 root zone, OIDC, billing alerts)
```

## State

Remote state in S3 (`next-tf-state-<account-id>`) with DynamoDB locking
(`next-tf-locks`). KMS-encrypted. State files are environment-scoped; no shared
mutable state between environments.

## Apply

```bash
task tf:plan ENV=staging
task tf:apply ENV=staging   # after PR approval + reviewer eyes on the plan
```

Plans are posted to PRs by [`.github/workflows/terraform-plan.yml`](../../.github/workflows). Applies happen via [`.github/workflows/terraform-apply.yml`](../../.github/workflows) after merge.

## Conventions

- Every resource is tagged: `service=`, `domain=`, `env=`, `owner=`, `cost-category=`.
- KMS keys are per-domain; no platform-wide master key.
- VPCs are per-environment and non-routable to each other; egress through NAT or VPC endpoints only.
- All IAM uses [IRSA](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html); no static AWS keys in the cluster.
