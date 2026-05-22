# Security Incident Response

> What NEXT does when security is breached — credentials compromised, an account
> taken over, a service compromised, an attack underway. The **security**
> specialization of the platform incident process.

> The general incident process — severities, the lifecycle, roles, the
> blameless review — lives in [docs/resilience/incident-response.md](../resilience/incident-response.md);
> incident _authority_ lives in [docs/governance/incident-governance.md](../governance/incident-governance.md).
> This document adds the parts specific to **adversarial** incidents. It does
> not restate the general process.

## 0. Principle

A security incident differs from an operational one: there is an **adversary**.
That changes the response — **contain before you investigate** (a live attacker
will react to your moves), **preserve evidence** (you will need to know exactly
what happened), and **assume the adversary may still be present** until proven
otherwise.

## 1. Security incident classes

| Class                       | What it is                                                          |
| --------------------------- | ------------------------------------------------------------------- |
| **Credential compromise**   | leaked, stolen, or phished credentials or tokens                    |
| **Account takeover (ATO)**  | a user or creator account seized by an attacker                     |
| **Service compromise**      | a workload running attacker-controlled code or behaving maliciously |
| **Data exposure**           | unauthorized access to, or exfiltration of, data                    |
| **Supply-chain compromise** | a malicious dependency, image, or build artifact                    |
| **Active attack**           | DDoS, credential-stuffing wave, coordinated abuse surge             |

Severity uses the platform SEV scale ([docs/resilience/incident-response.md](../resilience/incident-response.md));
a confirmed data exposure or service compromise is SEV1/SEV2 by default.

## 2. Contain first

For an adversarial incident, **containment precedes investigation** — a live
attacker must be cut off before they do more, and before they see you
investigating:

| Class                   | Immediate containment                                                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Credential compromise   | revoke the credentials/tokens; rotate the secret; invalidate the token family ([identity-session-security.md](identity-session-security.md))  |
| Account takeover        | revoke all sessions; force secure re-auth; **freeze creator payouts** ([docs/economy/payouts.md](../economy/payouts.md))                      |
| Service compromise      | **quarantine the workload** — isolate it by network policy, stop it serving traffic, but capture its state for forensics before destroying it |
| Data exposure           | cut the access path; revoke the offending credential; scope the exposure                                                                      |
| Supply-chain compromise | block the artifact from deploying; roll back to a known-good signed artifact ([supply-chain-security.md](supply-chain-security.md))           |
| Active attack           | edge mitigation, trust-aware throttling, load shedding ([docs/resilience/incident-response.md](../resilience/incident-response.md) §8)        |

Containment is reversible-where-possible and **logged** — every containment
action is itself an audit event.

## 3. Preserve evidence

- Before destroying a compromised workload, **capture its state** — memory,
  disk, logs — for forensics.
- Forensic and audit logs are tamper-evident and retained
  ([security-observability.md](security-observability.md)) — the attack timeline
  is reconstructed from them.
- Containment actions must not _erase_ the evidence they contain — quarantine,
  then collect, then (if needed) destroy.

## 4. Rollback authority

- The Incident Commander or release owner may **roll back without further
  approval** — a fast rollback to a known-good, signed artifact is a primary
  security mitigation ([docs/governance/incident-governance.md](../governance/incident-governance.md) §5).
- Rollback is GitOps ([ADR 0004](../adr/0004-gitops-argocd.md)) — revert to a
  known-good `main` state; ArgoCD reconciles.
- For a supply-chain compromise, rollback targets a **verified-clean** artifact,
  not merely the previous one.

## 5. Creator account-takeover response

Creator ATO is singled out — a creator's account is their livelihood and their
audience's trust:

- immediate session revocation + forced secure re-authentication;
- **payout protection** — payouts held, payout-account changes frozen pending
  verification ([docs/economy/fraud-risk.md](../economy/fraud-risk.md));
- the creator is contacted on a **known-good, out-of-band channel** — not the
  potentially-compromised in-app channel;
- content published during the compromise window is reviewed;
- recovery follows the hardened recovery path ([identity-session-security.md](identity-session-security.md)).

## 6. Service-compromise isolation

- A compromised service is **quarantined**, not left running — network-isolated
  so it cannot pivot ([zero-trust-architecture.md](zero-trust-architecture.md),
  [infrastructure-hardening.md](infrastructure-hardening.md)).
- Zero-trust and segmentation cap the blast radius **before** the incident — the
  compromised service can only reach what its identity and network policy
  already allowed.
- Assume the attacker probed laterally — investigate what the compromised
  identity _could_ reach, and check whether it did.
- Workloads are redeployed from **verified-clean signed artifacts**.

## 7. AI-agent participation limits

In a security incident, AI agents **assist** — correlate signals, reconstruct
timelines, draft a rollback or a containment PR, surface relevant runbooks —
but ([docs/governance/incident-governance.md](../governance/incident-governance.md) §3,
[multi-agent-security-governance.md](multi-agent-security-governance.md)):

- an agent is **never** the Incident Commander or the authoritative
  decision-maker;
- an agent does **not** execute containment, rollback, credential rotation, or
  quarantine on its own authority — a human triggers it;
- every agent action runs under, and is attributed to, a human's authority;
- in a _security_ incident the bias toward agent escalation is strongest — a
  confidently-wrong agent during an active attack is especially dangerous.

## 8. Communication doctrine

- **Internal** — a dedicated, **access-controlled** incident channel (a security
  incident's details are themselves sensitive); a scribe keeps the timeline.
- **External** — user/public communication for a breach is honest, plain, and
  approved by the IC + communications lead; it does not over- or under-state.
- **Affected-user notification** — users whose accounts or data are affected are
  notified directly, with what happened and what to do.
- **Regulatory / legal** — incidents with legal dimensions (data breach,
  child-safety, financial) follow the restricted escalation path and involve the
  relevant council and counsel. This path is never agent-handled.

## 9. Post-incident — security

Every security SEV1/SEV2 gets a **blameless post-incident review**
([docs/resilience/incident-response.md](../resilience/incident-response.md) §7),
plus a security-specific output:

- the **attack path** is reconstructed and documented — how they got in, how far
  they got;
- each step of the path gets a **hardening action item** — the goal is that the
  _class_ of attack becomes infeasible, not just that this instance is closed;
- action items are tracked into the [technical-debt register](../technical-debt/technical-debt-register.md)
  where architectural;
- if the incident revealed a _governance_ gap, the EOS / a standard / an ADR is
  amended.

## Related

- [docs/resilience/incident-response.md](../resilience/incident-response.md) · [docs/governance/incident-governance.md](../governance/incident-governance.md) · [security-observability.md](security-observability.md) · [identity-session-security.md](identity-session-security.md) · [infrastructure-hardening.md](infrastructure-hardening.md)
