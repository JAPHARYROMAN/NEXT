# 0010. Secret management: Vault + External Secrets Operator

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: @next-ecosystem/security @next-ecosystem/sre
- **Tags**: security, infrastructure

## Context

We must store and serve credentials, API keys, signing material, and dynamic database credentials to workloads with strict rotation, audit, and access policies — without putting anything sensitive into git, env files, or Terraform state.

## Decision

**HashiCorp Vault** is the canonical secret store. **External Secrets Operator (ESO)** syncs secrets from Vault into Kubernetes `Secret` objects at runtime.

- Static secrets in Vault KV v2.
- Dynamic Postgres credentials via Vault's database engine.
- Workload identity via Kubernetes auth method, mapped to SPIFFE IDs.
- Transit engine for envelope encryption of PII columns.

## Alternatives considered

- **AWS Secrets Manager + Parameter Store** — capable, AWS-only, weaker dynamic-credential story than Vault. We use Secrets Manager for break-glass IAM credentials *only*.
- **Sealed Secrets** — fine for small clusters; encryption at rest in git is not the same as a real secret store, and rotation is awkward.
- **SOPS in git** — same objections as Sealed Secrets at our scale.

## Consequences

### Positive
- Single audit log for all secret access.
- Dynamic DB credentials with short TTL eliminate long-lived passwords.
- Application code reads from a Kubernetes secret (managed by ESO); zero Vault SDK coupling in services.
- KMS auto-unseal removes manual unseal toil.

### Negative
- Vault is a critical-tier service; needs its own DR and oncall.
- Operational learning curve on Vault policies + auth methods.

## Implementation notes

- Vault clusters: HA mode, 5 nodes, Raft storage, KMS auto-unseal per environment.
- Policies generated from code in [`infrastructure/security/vault`](../../infrastructure/security).
- ESO `ClusterSecretStore` per environment; per-namespace `SecretStore` constrains blast radius.
- Break-glass: a sealed envelope with a recovery key for each environment, stored offline.
