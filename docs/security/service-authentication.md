# Service-to-Service Authentication

> Inside NEXT, no service trusts another because they share a cluster. Every
> service has a cryptographic identity, every hop is mutually authenticated, and
> every call is authorized. This is zero-trust applied to the internal mesh.

## 0. Principle

The classic failure: a flat internal network where any compromised workload can
talk to anything. NEXT's internal traffic is **mutually authenticated and
authorized per call** — the network grants nothing
([zero-trust-architecture.md](zero-trust-architecture.md)).

Grounded in [ADR 0018](../adr/0018-workload-identity.md) (SPIFFE/SPIRE),
[ADR 0003](../adr/0003-service-mesh.md) (Istio ambient mesh),
[ADR 0022](../adr/0022-access-control-rego.md) (Rego authorization).

## 1. Workload identity

- Every workload (service, job, AI worker, agent process) runs as a
  **SPIFFE identity** issued by SPIRE ([ADR 0018](../adr/0018-workload-identity.md))
  — a cryptographically verifiable identity tied to the workload, not to an IP
  or a network zone.
- Identities are **per-service and scoped** — no shared "internal" identity, no
  identity reuse across services.
- The identity is **short-lived and auto-rotated** — SPIRE re-issues; a leaked
  workload credential expires on its own.

## 2. mTLS — every hop

- All service-to-service traffic is **mutual TLS** via the Istio ambient mesh
  ([ADR 0003](../adr/0003-service-mesh.md)). Both ends present and verify a
  workload identity; traffic is encrypted in transit.
- mTLS is `STRICT` in every non-local environment — plaintext internal traffic
  is rejected, not merely discouraged.
- The mesh handles mTLS transparently; services do not hand-roll TLS — which
  also means the guarantee is uniform and cannot be forgotten per service.

## 3. Internal authorization

Authentication answers _who is calling_; authorization answers _may they_. Both
are required.

- The caller's verified workload identity is the input to an **authorization
  policy** — Rego policy bundles ([ADR 0022](../adr/0022-access-control-rego.md))
  evaluated via `access-control`.
- A service declares which callers may invoke which RPCs; the default is
  **deny** — a call path not explicitly allowed is refused.
- Authorization is **per request**, not a one-time handshake — every call is a
  fresh decision.

## 4. Secret management

- Secrets live in **Vault**; workloads receive them via the External Secrets
  Operator ([ADR 0010](../adr/0010-secrets.md)).
- Secrets are **workload-bound** — scoped to the workload identity that needs
  them; a service cannot read another service's secrets.
- Prefer **ephemeral, dynamically-issued credentials** (e.g. short-lived
  database credentials) over long-lived static ones — a credential that expires
  in hours is a far smaller prize.
- **Rotation** is routine and automated; a long-lived static secret is a flagged
  exception with a rotation plan.
- **No secret is ever committed** to the repo, baked into an image, or placed in
  an environment variable that lands in a log
  ([docs/standards/security-standards.md](../standards/security-standards.md)).
- **Environment isolation** — `dev`/`staging`/`production` secrets are entirely
  separate; a non-production credential can never unlock production.

## 5. Request signing & integrity

- mTLS already authenticates and integrity-protects the channel between two
  hops.
- For data that must be verifiable **beyond a single hop** — an event passing
  producer → bus → consumer, a token used downstream — integrity is carried in
  the payload: a signed token, an authenticated envelope
  ([event-security.md](event-security.md), [api-security.md](api-security.md)).
- The principle: a security property must hold for the _whole path_ the data
  travels, not just the link in front of it.

## 6. The trusted gateway

- `api-gateway` is the **single authenticated entry** from clients to the
  internal mesh — it verifies the external user, then propagates a verified
  identity inward ([api-security.md](api-security.md)).
- Clients **cannot** reach internal services directly — only the gateway.
- The gateway itself is a meshed workload with its own identity; it is trusted
  for _what it is allowed to do_, not unconditionally.

## 7. Multi-region & specialized workloads

- **Multi-region** — workload identity and mTLS span regions; a cross-region
  call is authenticated identically to an in-region one.
- **AI workloads** — inference services and GPU workers carry workload identity
  like any service; an AI workload is not an unauthenticated special case
  ([ai-security.md](ai-security.md)).
- **Event-driven** — producers and consumers authenticate to Kafka by workload
  identity; topic ACLs scope who may produce/consume ([event-security.md](event-security.md)).
- **Jobs and agents** — batch jobs and agent processes also run as scoped
  identities; nothing executes unidentified.

## 8. Prohibited patterns

- ✗ A service trusting a caller because it is "internal".
- ✗ Plaintext service-to-service traffic in a non-local environment.
- ✗ A shared or reused workload identity.
- ✗ A long-lived static secret without a rotation plan.
- ✗ A secret committed, image-baked, or log-leaked.
- ✗ A client reaching an internal service without passing the gateway.
- ✗ An authenticated-but-unauthorized call path (auth without authz).
- ✗ Cross-environment credential reuse.

## Related

- [zero-trust-architecture.md](zero-trust-architecture.md) · [api-security.md](api-security.md) · [event-security.md](event-security.md) · ADRs [0003](../adr/0003-service-mesh.md), [0010](../adr/0010-secrets.md), [0018](../adr/0018-workload-identity.md), [0022](../adr/0022-access-control-rego.md)
