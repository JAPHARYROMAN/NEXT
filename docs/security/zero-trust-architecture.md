# NEXT Zero-Trust Architecture

> The trust boundary of NEXT. Its premise: **the network is hostile** — being
> inside the cluster, the region, or the VPC grants nothing. Trust is earned
> per request, by identity and policy, never by location.

## 0. Philosophy

NEXT security protects users, creators, privacy, integrity, and resilience —
**without** hostile UX, excessive surveillance, or security theater. Good
security here is _calm_: invisible to the honest user, transparent where it must
be, resilient under attack. A control that adds friction without reducing real
risk is theater and is cut.

This directory is the deep security **doctrine**; the one-page binding floor is
[docs/standards/security-standards.md](../standards/security-standards.md).
Where they could appear to differ, the standards floor and the security ADRs
govern.

## 1. The five zero-trust principles

1. **No implicit trust.** Network position confers nothing. A request from
   inside the mesh is treated exactly as warily as one from the public internet.
2. **Every workload has an identity.** Every service, job, and agent runs as a
   cryptographically verifiable identity ([service-authentication.md](service-authentication.md)).
3. **Every request is authenticated and authorized.** Identity is verified _and_
   a policy decision is made, per request — not once at a perimeter.
4. **Least privilege, always.** Every principal — user, service, agent, secret —
   holds the minimum access for its task, scoped as narrowly as possible.
5. **Assume breach.** Design so that a compromise of one component is contained,
   detected, and recoverable — not catastrophic.

## 2. There is no perimeter — there are boundaries

NEXT does not have one castle wall. It has layered **trust boundaries**, each
enforcing identity + policy independently:

```
 internet
   │  edge: CloudFront + WAF + DDoS protection
   ▼
 api-gateway ───── verifies the user (OAuth2/OIDC + RS256 JWT, ADR 0012)
   │  mesh: mTLS, every hop (Istio, ADR 0003; SPIFFE/SPIRE, ADR 0018)
   ▼
 service ───────── verifies the caller's workload identity + authorizes (Rego, ADR 0022)
   │
   ▼
 datastore ─────── least-privilege credentials, scoped per service (ADR 0017)
```

A request that passes the edge is **not** trusted by the gateway; one past the
gateway is **not** trusted by a service; one past a service is **not** trusted
by a datastore. Each boundary re-verifies.

## 3. Network segmentation

- **Default-deny** between Kubernetes namespaces; every allowed path is an
  explicit network policy ([infrastructure-hardening.md](infrastructure-hardening.md)).
- Namespaces are bounded by domain (`next-identity`, `next-media`,
  `next-discovery`, …); a compromise in one namespace cannot freely reach
  another.
- Datastores are not publicly reachable; they accept connections only from
  their owning service's workloads.
- The edge is the only internet-facing surface; everything else is private.

Segmentation is the "assume breach" principle made concrete — it sets the blast
radius of any compromise.

## 4. Least privilege everywhere

| Principal          | Least-privilege rule                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| User               | holds only the scopes their tier grants ([identity-session-security.md](identity-session-security.md))         |
| Service            | a scoped datastore credential; mesh authorization to only the services it must call                            |
| Workload identity  | a SPIFFE ID scoped to one service; no shared identities                                                        |
| Secret             | scoped to one workload, short-lived where possible ([service-authentication.md](service-authentication.md) §4) |
| AI agent           | the bounded permission matrix ([multi-agent-security-governance.md](multi-agent-security-governance.md))       |
| Human (production) | just-in-time, audited, break-glass access ([infrastructure-hardening.md](infrastructure-hardening.md))         |

A broad grant is a reviewed, justified exception — never a default.

## 5. Trust-but-verify the runtime, not the network

The one thing NEXT _does_ trust is **verified identity + current policy**. A
service trusts a caller because the caller presented a valid workload identity
and policy allowed the call — not because the caller is "internal". This is the
inversion at the heart of zero-trust: trust is a _property of the request_, computed
now, not a _property of the network_, assumed forever.

## 6. The security architecture map

| Domain                                 | Doc                                                                      |
| -------------------------------------- | ------------------------------------------------------------------------ |
| Identity, sessions, account protection | [identity-session-security.md](identity-session-security.md)             |
| Service-to-service auth                | [service-authentication.md](service-authentication.md)                   |
| API security                           | [api-security.md](api-security.md)                                       |
| Event-bus security                     | [event-security.md](event-security.md)                                   |
| Media security                         | [media-security.md](media-security.md)                                   |
| AI security                            | [ai-security.md](ai-security.md)                                         |
| Infrastructure hardening               | [infrastructure-hardening.md](infrastructure-hardening.md)               |
| Supply chain                           | [supply-chain-security.md](supply-chain-security.md)                     |
| Privacy                                | [privacy-architecture.md](privacy-architecture.md)                       |
| Security observability                 | [security-observability.md](security-observability.md)                   |
| Security incident response             | [incident-response.md](incident-response.md)                             |
| Multi-agent security governance        | [multi-agent-security-governance.md](multi-agent-security-governance.md) |

## 7. Security is human-centered

The final principle, and the one that bounds all the others: NEXT must feel
**safe without feeling oppressive**. Concretely —

- security defaults to _protecting_ the user, not _suspecting_ them;
- friction (a challenge, an MFA prompt) is applied **proportionally to risk** —
  the honest user in a normal session sees almost none ([identity-session-security.md](identity-session-security.md));
- NEXT does not build a surveillance dossier to be "secure" — privacy is a
  security goal, not a casualty of it ([privacy-architecture.md](privacy-architecture.md));
- a person can see and understand the security state of their own account.

Zero-trust is about distrusting the _network_, not the _user_.

## Related

- [docs/standards/security-standards.md](../standards/security-standards.md) · ADRs [0003](../adr/0003-service-mesh.md), [0010](../adr/0010-secrets.md), [0012](../adr/0012-authentication.md), [0018](../adr/0018-workload-identity.md), [0022](../adr/0022-access-control-rego.md)
