# API Security

> Hardening every API surface — the external GraphQL plane, internal gRPC, REST
> ingress, and streaming. The API is where the platform meets untrusted input;
> this is how that input is contained.

## 0. Principle

Every API request is **untrusted until proven otherwise**. Security is applied
in depth: the edge filters volume and obvious abuse, the gateway authenticates
and validates, services authorize and re-validate. No single layer is the whole
defense.

Builds on [docs/standards/api-standards.md](../standards/api-standards.md) (the
binding API conventions); this doc is the security depth behind it.

## 1. The defense-in-depth path

```
 client
   │  edge: WAF + DDoS protection + geo/IP filtering + TLS termination
   ▼
 api-gateway: authenticate · schema-validate · rate-limit · payload-limit
   │  mesh mTLS
   ▼
 service api/: re-validate · authorize · business rules
```

Each layer assumes the one before it may have missed something.

## 2. Edge filtering

- The edge (CloudFront + WAF) terminates TLS, absorbs volumetric attacks
  ([incident-response.md](incident-response.md)), and applies coarse filters —
  known-bad IPs, obvious malicious patterns, geo rules where required.
- The edge is the **only** internet-facing surface; it shrinks what reaches the
  gateway to plausible traffic.

## 3. Authentication & auth propagation

- External callers authenticate at `api-gateway` — OAuth2/OIDC, RS256 JWT
  verified against JWKS ([identity-session-security.md](identity-session-security.md)).
- The gateway propagates a **verified identity** inward as request context; a
  downstream service receives an authenticated principal and **does not
  re-parse a raw token** ([service-authentication.md](service-authentication.md)).
- Internal calls authenticate by workload identity + mTLS.

## 4. Request & schema validation

- Every inbound request is **schema-validated at the boundary** before business
  logic — gRPC via `buf.validate` field constraints, GraphQL via typed schema +
  input validation, REST ingress via explicit validation.
- Validation covers types, formats (uuid, etc.), required fields, **and ranges /
  sizes** — a missing bound is a vulnerability.
- `domain` logic assumes validated input
  ([docs/standards/go-service-standards.md](../standards/go-service-standards.md)) —
  validation is concentrated at the edge of the service, not scattered.

## 5. Payload limits

- Every request has a **maximum size**; oversized payloads are rejected at the
  edge/gateway, not buffered.
- Collection inputs have a **maximum item count**; list/query APIs are
  cursor-paginated with a hard page-size cap ([api-standards.md](../standards/api-standards.md)).
- Streaming APIs have per-stream rate and size budgets.
- Unbounded input — a list with no cap, a body with no size limit — is a
  prohibited pattern; it is a denial-of-service vector.

## 6. Rate limiting & abuse throttling

- The gateway rate-limits per principal and per IP; abuse-prone endpoints
  (auth, recovery, search, AI-backed) carry tighter limits.
- **Trust-aware throttling** ([docs/trust-safety/risk-intelligence.md](../trust-safety/risk-intelligence.md))
  — limits scale inversely with trust: a high-trust user barely notices; a
  low-trust or anomalous caller hits friction. This sheds abusive load while
  protecting honest users — the calm-security principle.
- A rate-limited response is **explicit** — gRPC `ResourceExhausted` / a typed
  GraphQL error, with retry guidance — never a silent hang or drop.

## 7. Replay protection

- Money-moving and state-changing operations carry an **idempotency key**; a
  replayed request returns the original result, it does not re-execute
  ([docs/economy/ledger-architecture.md](../economy/ledger-architecture.md)).
- Sensitive signed requests carry a **timestamp + nonce**; a request outside a
  short freshness window, or a reused nonce, is rejected — a captured request
  cannot be replayed later.
- mTLS prevents in-transit tampering ([service-authentication.md](service-authentication.md)).

## 8. Error handling

- Error responses are **safe to surface** — a stable error code the client can
  branch on, never an internal detail, a stack trace, a secret, or a query.
- gRPC errors use semantically-correct `codes`; the gateway maps them to
  consistent GraphQL errors.
- An error is logged with full context internally and returned minimally
  externally — the asymmetry is deliberate.

## 9. Surface-specific notes

| Surface            | Notes                                                                            |
| ------------------ | -------------------------------------------------------------------------------- |
| GraphQL federation | query depth + complexity limits (prevent expensive-query DoS); per-subgraph auth |
| gRPC (internal)    | workload-identity auth + mTLS; `buf.validate`; never client-facing               |
| REST ingress       | explicit validation; the same edge + gateway path                                |
| Streaming          | per-stream rate/size budgets; auth re-checked at stream start                    |

## 10. Prohibited patterns

- ✗ A client reaching an internal service directly (bypassing the gateway).
- ✗ Unvalidated external input reaching business logic or a query.
- ✗ An unbounded payload size or an uncapped list/page size.
- ✗ Re-parsing a raw JWT downstream instead of trusting propagated identity.
- ✗ An error response leaking internals, a stack trace, or a secret.
- ✗ A state-changing or money-moving call with no idempotency/replay protection.
- ✗ A silent rate-limit (hang/drop) instead of an explicit, retryable error.
- ✗ A GraphQL endpoint with no query depth/complexity limit.

## Related

- [docs/standards/api-standards.md](../standards/api-standards.md) · [service-authentication.md](service-authentication.md) · [identity-session-security.md](identity-session-security.md) · [event-security.md](event-security.md)
