# NEXT Platform Economy

The economic backbone of NEXT — how creators earn, how money moves accountably,
and how the financial infrastructure of a human-centered creator civilization is
built. This is **architecture**: design documents, not implemented services.

> Empower creators. Protect users. Preserve trust. Stay auditable. Avoid
> predatory mechanics.

## Documents

| Doc                                                                  | Covers                                                                                               |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [platform-economy-architecture.md](platform-economy-architecture.md) | The master — doctrine, money flow, the proposed service map, the two-ledger model, security posture. |
| [creator-monetization.md](creator-monetization.md)                   | The monetization surfaces, revenue sharing, and the anti-dark-pattern rules.                         |
| [subscription-architecture.md](subscription-architecture.md)         | Plans, tiers, billing, renewal, grace periods, effortless cancellation.                              |
| [entitlements.md](entitlements.md)                                   | The entitlement system — caching, revocation, low-latency, degradation-safe.                         |
| [payment-provider-abstraction.md](payment-provider-abstraction.md)   | Provider abstraction, failover, the PCI boundary, idempotency, regional expansion.                   |
| [ledger-architecture.md](ledger-architecture.md)                     | The double-entry, append-only, idempotent financial ledger.                                          |
| [payouts.md](payouts.md)                                             | Payout accounts, schedules, balances, chargeback reserves, holds, failure handling.                  |
| [sponsorship-marketplace.md](sponsorship-marketplace.md)             | Brand ↔ creator campaigns, escrow, deliverable tracking, disclosure, anti-scam.                      |
| [fraud-risk.md](fraud-risk.md)                                       | Financial fraud detection, integrated with the trust & safety risk layer.                            |
| [tax-compliance-architecture.md](tax-compliance-architecture.md)     | Tax collection, invoices, creator forms, reporting — system architecture only.                       |
| [economy-events.md](economy-events.md)                               | The financial event catalog — zero-loss, idempotent, replayable.                                     |
| [resilience.md](resilience.md)                                       | Provider outages, idempotent retries, reconciliation, graceful degradation.                          |

## The economy in one paragraph

NEXT's economy is creator-first, transparent, auditable, fiat-based, and
provider-mediated — **no crypto tokens, no dark patterns, no gambling
mechanics**. Money flows from viewers and sponsors through external payment
providers (which tokenize cards — NEXT never stores raw card data) into a
double-entry, append-only ledger that always balances, splits into a transparent
platform fee and creator revenue, accrues through a chargeback window, and pays
out on a predictable schedule to bank, wallet, or mobile-money destinations.
Creators monetize through diversified surfaces — subscriptions, tips, premium
content, paid communities, live events, storefronts, and a sponsorship
marketplace with escrow and mandatory disclosure. Fraud is caught by friction
before punishment, integrated with the trust & safety risk layer. And the one
hard rule above all: **commerce can degrade, but it can never break core
playback**.

## Grounding & scope

- Builds on [docs/roadmap/creator-economy-evolution.md](../roadmap/creator-economy-evolution.md),
  [docs/trust-safety/risk-intelligence.md](../trust-safety/risk-intelligence.md),
  and [docs/trust-safety/creator-authenticity.md](../trust-safety/creator-authenticity.md).
- Consistent with the ADRs: event topology [0036](../adr/0036-event-topology.md),
  schema source of truth [0039](../adr/0039-event-schema-source-of-truth.md),
  database-per-service [0017](../adr/0017-database-per-service.md), ClickHouse
  [0035](../adr/0035-clickhouse-analytics-warehouse.md), canonical service
  layout [0038](../adr/0038-canonical-go-service-layout.md).
- **Architecture only.** Eight Go services are _proposed_
  ([platform-economy-architecture.md](platform-economy-architecture.md) §3) —
  `payment-service` exists as a scaffold; the rest are designed here and
  implemented in a later, separately-assigned phase. No payment provider is
  integrated, no credentials are configured, no financial secrets are stored.
- Several decisions here (the double-entry ledger model, the provider
  abstraction, the no-token stance, the commerce-never-breaks-playback rule)
  are load-bearing enough to warrant their own ADRs when implementation is
  scheduled.
