# Security infrastructure

Implements the zero-trust posture documented in [docs/security.md](../../docs/security.md) and ADRs [0010](../../docs/adr/0010-secrets.md), [0012](../../docs/adr/0012-authentication.md), [0018](../../docs/adr/0018-workload-identity.md).

```
security/
├── vault/             # Vault config, policies, auth backends
├── spire/             # SPIRE server + agent for workload identity
├── kyverno/           # Admission policies (no-latest-tag, signed images, etc.)
├── opa-gatekeeper/    # Constraint templates for K8s policy
├── falco/             # Runtime threat detection rules
└── network/           # Default-deny + per-domain NetworkPolicies
```

## Principles

1. **No long-lived credentials.** All workload auth is short-lived (SPIFFE SVIDs, Vault leases).
2. **mTLS everywhere internal.** Istio strict mode + per-service AuthorizationPolicy.
3. **Default deny.** NetworkPolicy + AuthorizationPolicy default-deny per namespace.
4. **Admission gates.** Kyverno blocks unsigned images, `:latest` tags, privileged pods, and root containers.
5. **Runtime detection.** Falco rules page on shell escapes, unexpected `setuid`, and known TTPs.
6. **Audit everything.** Every privileged action emits `audit.privileged.action.v1`; 7-year retention.

## Onboarding a new service

1. Define a Vault policy in [`vault/policies/<service>.hcl`](vault/policies).
2. Register the service's SPIFFE ID in [`spire/registration-entries.yaml`](spire).
3. Add the Istio `AuthorizationPolicy` allowing only its callers.
4. Ensure the image is signed by CI (handled by [`.github/workflows/image-build.yml`](../../.github/workflows)).
