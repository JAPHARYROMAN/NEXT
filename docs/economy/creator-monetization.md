# Creator Monetization

> The monetization surfaces NEXT offers creators, and the creator-first
> philosophy that shapes every one of them. The goal: a creator can earn a
> living from authentic work and a real community — without the platform
> turning them into a content factory.

## 0. Philosophy

Monetization at NEXT is designed against a specific failure: the creator economy
where the algorithm and the payout system hold all the leverage, opacity is the
norm, and monetization pressure quietly replaces creativity with output
([roadmap/anti-patterns.md](../roadmap/anti-patterns.md) AP-2). NEXT's counter:

- **Diversified by design** — many surfaces, so no single one is a chokepoint.
- **Authentic-community-rewarding** — surfaces reward real relationships, not
  manufactured engagement.
- **Small-creator-viable** — every surface works for a creator with a small,
  genuine audience, not only for the already-large.
- **Pressure-free** — monetization is opt-in and never degrades the experience
  of a creator (or viewer) who does not use it.

## 1. The monetization surfaces

### 1.1 Creator subscriptions / memberships

Recurring support with tiered benefits — the backbone of stable creator income.
Full design: [subscription-architecture.md](subscription-architecture.md).

### 1.2 Tipping / appreciation

One-time, no-strings support — a viewer rewards a moment they valued. Tipping is
deliberately _low-pressure_: no obligation is created, no benefit is gated, no
leaderboard shames non-tippers. It is appreciation, not a transaction.

### 1.3 Premium content

Individual paid videos or unlocks. Premium content grants an **entitlement**
([entitlements.md](entitlements.md)). The guardrail: premium must be _additive_
— a creator cannot paywall what the audience already had for free, and a
free-tier viewer always has a coherent experience.

### 1.4 Paid communities

Membership-gated community spaces ([docs/roadmap/community-evolution.md](../roadmap/community-evolution.md)).
The entitlement is community access; the value is belonging, not content volume.

### 1.5 Live event monetization

Ticketed live events, live tipping, and paid live access. Live monetization
settles through the same ledger; entitlements gate access; the live experience
degrades gracefully if commerce is unavailable ([resilience.md](resilience.md)).

### 1.6 Digital products & storefronts

Creators sell digital products — downloads, assets, presets, courses — through a
storefront. Owned by the proposed `commerce-service`. A purchase is a one-time
order granting a download/access entitlement.

### 1.7 Sponsorship marketplace

Brand ↔ creator campaigns, with escrow and mandatory disclosure. Full design:
[sponsorship-marketplace.md](sponsorship-marketplace.md).

### 1.8 Future — immersive commerce

Commerce inside immersive/spatial experiences. Gated with roadmap Phase E
([docs/roadmap/immersive-computing.md](../roadmap/immersive-computing.md)) —
designed-for, not built-now.

## 2. Revenue sharing

- The platform takes a **transparent, stated revenue share** per surface. The
  share is published, not buried; a creator always knows the split before they
  earn.
- The share is **calibrated to be creator-favorable** — NEXT's revenue comes
  from the ecosystem succeeding, not from extracting the maximum per transaction.
- Payment-provider processing fees are disclosed as a separate, pass-through
  line — never folded silently into the platform's share.
- Splits are encoded as ledger rules ([ledger-architecture.md](ledger-architecture.md));
  a creator can see exactly how any amount they earned was divided.

## 3. The anti-dark-pattern rules

These are hard rules, enforced as governance, not guidelines:

- **No dark-pattern subscriptions** — cancellation is as easy as signup, one
  flow, no retention maze ([subscription-architecture.md](subscription-architecture.md)).
- **No hidden fees** — every fee is shown before the user commits.
- **No gambling mechanics** — no loot boxes, no randomized paid rewards, no
  variable-reward monetization. Paid means _known_ value for _known_ price.
- **No artificial-scarcity abuse** — scarcity (limited drops, time-limited
  access) is allowed only when genuine; manufactured false scarcity is
  prohibited.
- **No manipulative paywalls** — a paywall states plainly what is behind it; it
  does not bait-and-switch or interrupt deceptively.
- **No predatory creator tools** — NEXT will not ship a creator a tool whose
  main effect is to extract more from their audience through pressure.

A monetization feature that needs a dark pattern to work does not ship.

## 4. Monetization eligibility

- Monetization surfaces unlock on **simple, transparent eligibility** — a real,
  verified account in good standing ([docs/trust-safety/trust-architecture.md](../trust-safety/trust-architecture.md)),
  not an opaque follower threshold that gatekeeps small creators.
- Eligibility is **explainable** — a creator who is not yet eligible is told
  exactly what is required.
- Eligibility never depends on a popularity bar that would recreate the
  algorithmic class system ([docs/trust-safety/recommendation-integration.md](../trust-safety/recommendation-integration.md)).
- Upheld trust & safety violations can suspend monetization eligibility — but
  this is disclosed, severity-proportionate, decaying, and appealable, exactly
  like any enforcement action.

## 5. Monetization analytics

Creators get **explanatory** monetization analytics ([economy-events.md](economy-events.md)
→ ClickHouse): revenue by surface, subscriber growth and churn, tip and
purchase patterns, sponsorship performance. The analytics answer _"what is
working and why"_ — they are not a pressure dashboard nudging creators toward
more output. Per [docs/roadmap/creator-economy-evolution.md](../roadmap/creator-economy-evolution.md),
this is part of treating the creator as a media-business operator.

## 6. The creator-revenue lifecycle

```
 a viewer pays ──▶ ledger records the split ──▶ creator revenue accrues (pending)
        │                                              │  clears chargeback window
        ▼                                              ▼
 entitlement granted                          revenue becomes available ──▶ payout
```

Revenue is **pending** until the chargeback/refund window for the originating
payment clears, then **available** for payout ([payouts.md](payouts.md)). The
creator sees both balances and the reason for any hold — no silent withholding.

## Related documents

- [subscription-architecture.md](subscription-architecture.md) · [entitlements.md](entitlements.md) · [sponsorship-marketplace.md](sponsorship-marketplace.md) · [payouts.md](payouts.md) · [ledger-architecture.md](ledger-architecture.md)
- [docs/roadmap/creator-economy-evolution.md](../roadmap/creator-economy-evolution.md)
