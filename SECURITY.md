# Security policy

## Reporting a vulnerability

**Do not open a public issue.** Email `security@next.example` with:

- Affected service, version, environment
- Reproduction steps
- Impact assessment
- Your PGP key if you want an encrypted reply

You will receive an acknowledgement within 48 hours and a triage status within 5 business days.

We follow [coordinated disclosure](https://www.cisa.gov/coordinated-vulnerability-disclosure-process). We will publish a CVE and credit you once a fix has shipped to production unless you prefer otherwise.

## Scope

In scope:

- All services in [`/services`](services/)
- All applications in [`/apps`](apps/)
- All AI systems in [`/ai`](ai/)
- All infrastructure-as-code in [`/infrastructure`](infrastructure/)
- All exposed APIs (GraphQL, REST, gRPC, WebSocket)
- Authentication and authorization flows
- The CI/CD pipeline itself

Out of scope:

- Denial-of-service against shared infra (use scoped load tests under [tests/load](tests/load) instead)
- Social engineering of staff
- Physical attacks
- Reports requiring root access to user devices
- Reports against deprecated branches more than 90 days old

## Posture summary

| Control | Implementation |
| --- | --- |
| Service-to-service auth | mTLS via Istio, SPIFFE identities |
| User auth | OAuth2 + OIDC, RS256 JWT with 15-minute access tokens |
| Secret storage | HashiCorp Vault + External Secrets Operator; no secrets in env files |
| Network policy | Default-deny Kubernetes NetworkPolicy + Istio AuthorizationPolicy |
| Image supply chain | Cosign-signed images, SBOM (CycloneDX) per build, admission gated by Kyverno |
| Static analysis | CodeQL, semgrep, gosec, cargo-audit, pip-audit |
| Dependency scanning | Renovate + GitHub Dependabot alerts + Trivy on every image |
| Runtime detection | Falco rules on every node, alerts to Grafana / PagerDuty |
| Encryption at rest | KMS-managed keys on all RDS, S3, EBS, OpenSearch, ClickHouse |
| Encryption in transit | TLS 1.3 only; mTLS internal; AWS Certificate Manager for public certs |
| Audit logging | CloudTrail + per-service audit log topic on Kafka, retained 7 years |

Full posture in [docs/security.md](docs/security.md).

## Hall of fame

Security researchers credited with valid reports will be listed in [docs/security-acknowledgements.md](docs/security-acknowledgements.md) (created on first credit).
