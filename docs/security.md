# Security

Reference for posture, controls, and procedures. Operational specifics in [SECURITY.md](../SECURITY.md) at the root.

## Posture summary

| Control | Implementation |
| --- | --- |
| Workload identity | SPIFFE / SPIRE; auto-rotated SVIDs ([ADR 0018](adr/0018-workload-identity.md)) |
| Service-to-service auth | Istio mTLS strict mode ([ADR 0003](adr/0003-service-mesh.md)) |
| User auth | OAuth2 + OIDC, RS256 JWT ([ADR 0012](adr/0012-authentication.md)) |
| Secrets | Vault + External Secrets Operator ([ADR 0010](adr/0010-secrets.md)) |
| Default deny | NetworkPolicy + AuthorizationPolicy per namespace |
| Admission control | Kyverno: image signatures, pinned tags, non-root, resource limits |
| Image supply chain | Cosign-signed via OIDC + SBOM (CycloneDX) per build |
| Runtime detection | Falco rules on every node |
| Vulnerability scanning | Trivy on every image; CodeQL + semgrep + gosec; pip-audit; cargo-audit |
| Dependency hygiene | Renovate weekly; Dependabot alerts |
| Encryption at rest | KMS CMK per domain (RDS, ElastiCache, S3, OpenSearch, ClickHouse) |
| Encryption in transit | TLS 1.3 only; mTLS internal |
| Audit logging | `audit.privileged.action.v1` topic; 7-year retention on ClickHouse + S3 Glacier |
| Compliance | SOC 2 program; quarterly external pentests; bug bounty |

## Threat model

We use [STRIDE](https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats) per service. Architecture-affecting PRs include an updated threat model.

The platform-level top concerns:

1. **Account takeover** — mitigated by passkeys + refresh-token rotation + device attestation.
2. **CSAM upload** — mitigated by hash matching (PhotoDNA + NCMEC) + ML classifier ensemble + human review before public exposure.
3. **Creator payment fraud** — mitigated by ledger immutability + payment-service idempotency + processor-side risk scoring.
4. **Supply-chain compromise** — mitigated by Cosign-signed builds + SBOM + Kyverno admission + Renovate.
5. **Data exfiltration** — mitigated by least-privilege Vault policies + per-domain KMS keys + VPC endpoints (no internet egress for stateful tiers).

## Incident response

See [docs/runbooks/incident-response.md](runbooks/incident-response.md). Sev 1 / Sev 2 incidents follow:

1. **Detect** — alert pages on-call.
2. **Contain** — kill switches per feature; cordon-and-drain a service if needed.
3. **Eradicate** — fix the bug or rotate the credential.
4. **Recover** — verify SLOs return to green.
5. **Learn** — blameless post-mortem within 5 business days.
