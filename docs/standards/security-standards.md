# Security Standards

> The enforceable security floor for every service, app, and contributor.
> Grounded in [ADR 0012](../adr/0012-authentication.md) (OAuth2/OIDC + RS256),
> [ADR 0018](../adr/0018-workload-identity.md) (SPIFFE/SPIRE),
> [ADR 0022](../adr/0022-access-control-rego.md) (Rego), [ADR 0010](../adr/0010-secrets.md)
> (Vault).

Status: **binding**.

## 1. Secure defaults

- Every system defaults to the **secure** option — closed, denied,
  least-privilege, encrypted — and is opened deliberately, not the reverse.
- A new endpoint is **authenticated by default**; a public endpoint is an
  explicit, reviewed decision.
- A new permission grant starts at **none** and is widened deliberately.

## 2. Authentication

- External callers authenticate via OAuth2/OIDC; tokens are RS256 JWTs verified
  against JWKS ([ADR 0012](../adr/0012-authentication.md)), at `api-gateway`.
- A verified identity propagates inward as request context — a downstream
  service does **not** re-parse raw tokens ([api-standards.md](api-standards.md) §6).
- Service-to-service identity is the mesh — SPIFFE/SPIRE workload identity +
  mTLS ([ADR 0003](../adr/0003-service-mesh.md), [ADR 0018](../adr/0018-workload-identity.md)),
  `STRICT` in non-local environments.

## 3. Authorization & RBAC

- Authorization decisions go through `access-control` — Rego policy bundles
  ([ADR 0022](../adr/0022-access-control-rego.md)) — not ad-hoc per-service `if`
  checks.
- **Least privilege** — every principal (user, service, agent, job) holds the
  minimum permission for its task; broad grants are reviewed and justified.
- Privileged actions are **audited** (`audit.events.v1`).

## 4. Secret handling

- Secrets live in **Vault**; delivered via External Secrets ([ADR 0010](../adr/0010-secrets.md)).
- **No secret is ever committed** — code, config, manifests, Terraform, compose,
  seed data, tests. CI secret-scans every PR ([enforcement-mechanisms.md](enforcement-mechanisms.md)).
- Secrets are never logged, never put in an error message, never in a trace
  attribute.
- A leaked secret is rotated immediately and treated as an incident.

## 5. Input validation

- Validate at **trust boundaries** — every external input (API request, event
  from an untrusted producer, file upload) is validated before use
  ([api-standards.md](api-standards.md) §5).
- Internal, already-validated data is trusted — do not scatter redundant
  defensive checks for states that cannot occur.
- Guard against the OWASP top 10 — injection, XSS, SSRF, etc. — at the boundary;
  parameterized queries always.

## 6. Logging redaction

- **No secrets, no PII, no card data, no payout details, no raw tokens** in
  logs, traces, or error messages ([observability-standards.md](observability-standards.md) §4).
- Sensitive fields are redacted at the logging boundary, structurally — not by
  remembering to omit them.

## 7. Data protection

- Sensitive data (PII, financial, identity) is encrypted at rest where required
  and always in transit (TLS / mesh mTLS).
- Payment instruments are provider-tokenized; **NEXT never stores raw card data**
  ([docs/economy/payment-provider-abstraction.md](../economy/payment-provider-abstraction.md)).
- Access to sensitive data is least-privilege and audited.

## 8. Audit requirements

- Every privileged / administrative / financial / moderation action writes an
  immutable audit record (`audit.events.v1`).
- Audit records are append-only and are **never** subject to decay or deletion
  ([docs/trust-safety/appeals-system.md](../trust-safety/appeals-system.md) §5).

## 9. Financial-admin controls

- Financial operations and data are tightly scoped; financial admin actions
  require elevated, audited authority ([docs/economy/platform-economy-architecture.md](../economy/platform-economy-architecture.md) §6).
- The PCI boundary is the payment provider — NEXT handles tokens and ledger
  entries, never card numbers.

## 10. AI-agent security rules

- No agent may weaken or bypass a security gate, commit a secret, or change an
  auth/security boundary autonomously — a security-boundary change is
  `GOVERNED + HUMAN` ([docs/governance/ai-agent-permissions.md](../governance/ai-agent-permissions.md)).
- Dual-use / security-sensitive code requires explicit review.

## 11. Prohibited patterns

- ✗ A secret committed anywhere in the repo.
- ✗ A secret or PII in a log, trace, or error message.
- ✗ A new endpoint public by default, or unauthenticated without review.
- ✗ Ad-hoc per-service authorization instead of `access-control`.
- ✗ Raw card data touching a NEXT server.
- ✗ Unvalidated external input reaching business logic or a query.
- ✗ A broad permission grant without review and justification.
- ✗ An agent disabling a security gate to make CI pass.

## Related

- ADRs [0010](../adr/0010-secrets.md), [0012](../adr/0012-authentication.md), [0018](../adr/0018-workload-identity.md), [0022](../adr/0022-access-control-rego.md) · [observability-standards.md](observability-standards.md) · [docs/governance/ai-agent-permissions.md](../governance/ai-agent-permissions.md)
