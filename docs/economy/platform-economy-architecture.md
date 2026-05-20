# NEXT Platform Economy Architecture

> The financial operating system of NEXT — how money moves between viewers,
> creators, sponsors, and the platform, accountably and at planetary scale.
> Architecture only: no payment services are implemented in this phase.

## 0. Doctrine

The NEXT economy exists to **empower creators without turning them into content
factories**. Six invariants govern every economic mechanism:

1. **Creator-first.** The economy moves value _to creators_; the platform's
   share is a transparent, stated fee — never a hidden tax.
2. **Transparent.** Every fee, every revenue split, every renewal term is
   disclosed plainly. No hidden fees, no dark patterns.
3. **No predatory mechanics.** No dark-pattern subscriptions, no gambling-like
   loot mechanics, no artificial-scarcity abuse, no manipulative paywalls.
4. **Auditable.** Every cent is a balanced, append-only ledger entry. The books
   always reconcile ([ledger-architecture.md](ledger-architecture.md)).
5. **Diversified.** Creators are pushed toward _multiple_ revenue streams so no
   single change can end a livelihood ([roadmap/anti-patterns.md](../roadmap/anti-patterns.md) AP-2).
6. **Fiat, provider-mediated.** NEXT's economy is real-currency, processed
   through regulated payment providers. There are **no crypto tokens or
   speculative instruments** — introducing any would require its own ADR and is
   explicitly out of scope.

An economic mechanism that raises revenue but violates an invariant is rejected.

## 1. Money flow

```
 viewer / sponsor
        │  pays (card, wallet, mobile money …)
        ▼
 payment provider (Stripe / Adyen / PayPal / mobile money)  ── tokenizes; NEXT never sees raw card data
        │  authorized + captured
        ▼
 NEXT ledger ── double-entry: debit viewer-funds, credit { platform-fee, creator-revenue }
        │
        ├──▶ platform fee account        (NEXT's transparent, stated share)
        └──▶ creator revenue ledger      (pending → available)
                  │  payout schedule
                  ▼
            payout provider ──▶ creator's payout account (bank, wallet, mobile money)
```

Every arrow is a **balanced ledger transaction**. Money is never created or
destroyed in the system — only moved between accounts — and every movement is an
immutable, idempotent event.

## 2. The monetization surfaces

| Surface                             | What it is                                     |
| ----------------------------------- | ---------------------------------------------- |
| Creator subscriptions / memberships | recurring support with tiered benefits         |
| Tipping / appreciation              | one-time, no-strings support                   |
| Premium content                     | individual paid videos / unlocks               |
| Paid communities                    | membership-gated community spaces              |
| Live event monetization             | ticketed live, live tipping, paid access       |
| Digital products / storefronts      | downloads, assets, creator goods               |
| Sponsorship marketplace             | brand ↔ creator campaigns                      |
| (future) immersive commerce         | spatial/immersive experiences — gated, Phase E |

Each is detailed in [creator-monetization.md](creator-monetization.md). All
settle through the same ledger and payout machinery — the surfaces differ; the
financial core is one.

## 3. Proposed service map

The economy is designed as eight **Go services** ([ADR 0007](../adr/0007-backend-languages.md),
canonical layout [ADR 0038](../adr/0038-canonical-go-service-layout.md)).
`payment-service` exists today as a scaffold; the rest are **proposed** — designed
here, implemented in a later, separately-assigned phase.

| Service                   | Responsibility                                                  | Owns                               |
| ------------------------- | --------------------------------------------------------------- | ---------------------------------- |
| `payment-service`         | provider abstraction; authorize/capture/refund                  | payment metadata, idempotency keys |
| `subscription-service`    | plans, tiers, billing cycles, renewals, cancellation            | subscriptions, plans               |
| `creator-revenue-service` | the double-entry ledger; revenue accrual; balances              | the ledger, balances               |
| `payout-service`          | payout accounts, schedules, holds, reserves, payout execution   | payout accounts, payout records    |
| `commerce-service`        | one-time purchases, digital products, storefronts, entitlements | products, orders, entitlements     |
| `sponsorship-service`     | brand accounts, campaigns, escrow, deliverables                 | campaigns, brand accounts          |
| `fraud-risk-service`      | financial fraud + risk scoring                                  | risk cases, risk signals           |
| `tax-compliance-service`  | tax calculation, invoices, receipts, creator tax forms          | tax records, invoices              |

Each service: gRPC API; its own Postgres ([ADR 0017](../adr/0017-database-per-service.md));
emits/consumes `commerce.events.v1` ([ADR 0036](../adr/0036-event-topology.md));
OTel-instrumented ([ADR 0009](../adr/0009-observability.md)). Per-service detail
is in the domain docs of this directory.

## 4. The two-ledger model

NEXT keeps a clear separation:

- **The platform ledger** — the double-entry record of _all_ money movement
  ([ledger-architecture.md](ledger-architecture.md)). It is the financial source
  of truth; it always balances.
- **The creator revenue view** — each creator's accrued, pending, and available
  balances, projected from the ledger ([payouts.md](payouts.md)). It is what a
  creator sees and is paid from.

The revenue view is _derived from_ the ledger — never the other way round. The
ledger is authoritative; the creator-facing balance is a projection.

## 5. Entitlements: the value the money buys

Paying for something grants an **entitlement** — the right to access premium
content, a community, a live event, a download. Entitlements are derived from
payments/subscriptions, cached for low-latency checks, and revocable
([entitlements.md](entitlements.md)). Critically: **an entitlement check failing
must never break core playback** — commerce degrades gracefully
([resilience.md](resilience.md)); a viewer's free content always plays.

## 6. Security posture

- **NEXT never stores raw card data.** Payment instruments are tokenized by the
  provider; NEXT stores only provider tokens. The PCI scope is minimized to the
  provider boundary.
- **Least privilege** — financial data and operations are tightly scoped; financial
  admin actions are audited (`audit.events.v1`).
- **No financial secrets in the repo** — provider credentials live in Vault +
  External Secrets ([ADR 0010](../adr/0010-secrets.md)); none are committed.
- **Sensitive-data redaction** — financial identifiers are redacted in logs and
  traces.
- Full security model is woven through each domain doc; the boundary principle
  is constant — the platform handles _tokens and ledger entries_, never _card
  numbers_.

## 7. Governance

Monetization eligibility, payout-hold policy, sponsorship transparency rules,
premium-content enforcement, fraud escalation, and financial appeals are
governed — see each domain doc, and the platform governance model
([docs/governance](../governance/README.md)). Financial appeals follow the same
explainable, recourse-bearing doctrine as moderation appeals
([docs/trust-safety/appeals-system.md](../trust-safety/appeals-system.md)) — a
creator whose payout is held is told why and can appeal.

## 8. This directory

| Doc                                                                | Covers                                                                     |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| [creator-monetization.md](creator-monetization.md)                 | the monetization surfaces; the creator-first philosophy                    |
| [subscription-architecture.md](subscription-architecture.md)       | plans, tiers, billing, renewal, anti-dark-pattern cancellation             |
| [entitlements.md](entitlements.md)                                 | the entitlement system — caching, revocation, low latency                  |
| [payment-provider-abstraction.md](payment-provider-abstraction.md) | provider abstraction, failover, no lock-in                                 |
| [ledger-architecture.md](ledger-architecture.md)                   | the double-entry append-only financial ledger                              |
| [payouts.md](payouts.md)                                           | payout accounts, schedules, balances, reserves, holds                      |
| [sponsorship-marketplace.md](sponsorship-marketplace.md)           | brand ↔ creator campaigns, escrow, disclosure                              |
| [fraud-risk.md](fraud-risk.md)                                     | financial fraud + risk, integrated with trust & safety                     |
| [tax-compliance-architecture.md](tax-compliance-architecture.md)   | tax, invoices, receipts, creator forms — architecture only                 |
| [economy-events.md](economy-events.md)                             | the financial event catalog                                                |
| [resilience.md](resilience.md)                                     | provider outages, idempotent retries, reconciliation, graceful degradation |

## Related documents

- [docs/roadmap/creator-economy-evolution.md](../roadmap/creator-economy-evolution.md) · [docs/trust-safety/risk-intelligence.md](../trust-safety/risk-intelligence.md) · [docs/governance/README.md](../governance/README.md)
