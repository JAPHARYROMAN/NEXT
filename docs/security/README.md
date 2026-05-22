# NEXT Security & Zero-Trust Architecture

The trust boundary of NEXT — the security doctrine, zero-trust architecture, and
platform hardening that protect users, creators, privacy, and integrity at
planetary scale. This is **architecture and doctrine**, not deployed tooling.

> NEXT should feel safe without feeling oppressive.

## Start here

[**zero-trust-architecture.md**](zero-trust-architecture.md) is the master — the
five zero-trust principles, the layered trust boundaries, network segmentation,
and the human-centered security philosophy. Read it first.

## Documents

| Doc                                                                      | Covers                                                                                            |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| [zero-trust-architecture.md](zero-trust-architecture.md)                 | the master — no implicit trust, trust boundaries, segmentation, least privilege                   |
| [identity-session-security.md](identity-session-security.md)             | user/creator auth, session rotation + theft detection, MFA, passkeys, ATO detection, recovery     |
| [service-authentication.md](service-authentication.md)                   | SPIFFE workload identity, mesh mTLS, internal authorization, secret management                    |
| [api-security.md](api-security.md)                                       | defense-in-depth on the API surface — edge, gateway, validation, rate limits, replay protection   |
| [event-security.md](event-security.md)                                   | trusted producers, event authenticity, Kafka ACLs, replay prevention, DLQ trust                   |
| [media-security.md](media-security.md)                                   | signed playback URLs, upload validation, transcoding isolation, anti-piracy, livestream integrity |
| [ai-security.md](ai-security.md)                                         | model isolation, prompt-injection defense, poisoning mitigation, inference-abuse protection       |
| [infrastructure-hardening.md](infrastructure-hardening.md)               | Kubernetes/pod hardening, network policy, edge protection, production access doctrine             |
| [supply-chain-security.md](supply-chain-security.md)                     | dependency verification, SBOMs, image signing, build provenance, the trust chain                  |
| [privacy-architecture.md](privacy-architecture.md)                       | data minimization, consent, retention, deletion (crypto-shredding), residency                     |
| [security-observability.md](security-observability.md)                   | security telemetry, anomaly detection, audit trails, forensic logging                             |
| [incident-response.md](incident-response.md)                             | the security-incident specialization — contain first, preserve evidence, attack-path hardening    |
| [multi-agent-security-governance.md](multi-agent-security-governance.md) | the security view of the AI-agent permission model                                                |

## The doctrine in one paragraph

NEXT assumes the network is hostile: being inside the cluster grants nothing.
Every workload has a cryptographic identity, every hop is mutually authenticated
(mTLS), every request is authorized per call, and every secret is scoped to one
workload and short-lived. Trust is a property of the _verified request_, never
of the _network location_. Layered boundaries — edge, gateway, mesh, service,
datastore — each re-verify; segmentation and least privilege keep any breach
contained ("assume breach"). Identity uses risk-proportionate friction so honest
users barely notice; APIs, events, media, and AI each have a depth-in-defense
model; the supply chain is verifiable source-to-production; privacy is a
security _goal_ — NEXT personalizes without a surveillance dossier; and AI
agents operate inside a permission model that contains a confident mistake.
Security here is calm: invisible when it can be, transparent when it must be,
human-centered always.

## Grounding & scope

- Builds on the security ADRs — [0003](../adr/0003-service-mesh.md) (mesh),
  [0010](../adr/0010-secrets.md) (Vault), [0012](../adr/0012-authentication.md)
  (OAuth2/OIDC), [0018](../adr/0018-workload-identity.md) (SPIFFE/SPIRE),
  [0022](../adr/0022-access-control-rego.md) (Rego), [0027](../adr/0027-signed-playback-urls.md)
  (signed URLs) — and on the trust/safety, resilience, economy, and standards
  docs.
- This directory is the deep **doctrine**; the binding one-page floor is
  [docs/standards/security-standards.md](../standards/security-standards.md).
  Where they could differ, the standards floor and the ADRs govern.
- **Architecture only.** No security tooling is deployed, no production secret
  is created, no service is modified. Several decisions here (the zero-trust
  boundary model, crypto-shredding for deletion, the supply-chain trust chain,
  forensic-log retention) are load-bearing enough to warrant their own ADRs when
  the corresponding work is scheduled.
- Compliance content is **system architecture** designed to _support_ legal
  regimes — it is not legal advice.
