# Governance

How NEXT makes decisions, resolves disagreements, and evolves over time.

## Roles

| Role | Scope |
| --- | --- |
| **Contributors** | Anyone with a merged PR. |
| **Maintainers** | Have write access to one or more domains; appear in [CODEOWNERS](.github/CODEOWNERS). |
| **Domain leads** | One per top-level domain (e.g. Identity, Media, ML-Discovery). Steward roadmap and architecture for their domain. |
| **Architecture council** | Domain leads + a rotating engineering chair. Reviews cross-domain ADRs. |
| **Security council** | Security team leads + a rotating maintainer. Handles disclosures and posture. |

## Decision-making

We default to **lazy consensus** for everything that is not load-bearing across multiple domains. A PR that satisfies the [CONTRIBUTING.md](CONTRIBUTING.md) bar can be merged once review and CI pass.

For load-bearing decisions — new services, new languages, contract changes, tenancy changes, anything visible to creators — write an [ADR](docs/adr/). The ADR moves through:

```
Proposed  →  Discussion  →  Accepted | Rejected | Superseded
```

If discussion stalls or domains disagree, the architecture council resolves it within 10 business days. If they cannot agree, the engineering chair decides.

Decisions are **reversible** by default — superseding an ADR is a normal occurrence. We optimize for movement, not perfection.

## Adding a new service

1. ADR proposing the service, with API and event contracts.
2. CODEOWNERS entry + on-call rotation registered.
3. Standard observability + security gates met (SLOs, runbook, threat model).
4. Listed in [docs/system-layers.md](docs/system-layers.md).

See [docs/runbooks/new-service-checklist.md](docs/runbooks/new-service-checklist.md).

## Adding a new top-level technology

A new database, queue, or runtime is a multi-year commitment. Requires:

- ADR with at least one rejected alternative
- Operational ownership identified
- Cost model (compute, network, oncall load)
- Architecture council acceptance

## Removing things

Removing a service, deprecating an API, or sunsetting a product follows the same ADR + council path as adding one. We treat removal as a feature.

## Conflict resolution

1. Talk it out in the PR or issue.
2. Loop in the relevant domain lead.
3. Architecture council if cross-domain.
4. Engineering chair for tiebreak.

Disagreements are normal and welcome. Personal attacks are not — see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
