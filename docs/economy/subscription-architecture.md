# Subscription Architecture

> Recurring creator support — the backbone of stable creator income — designed
> so renewal terms are clear, cancellation is effortless, and the only thing a
> subscription ever does is what the subscriber agreed to.

## 0. Principle

A subscription is a **standing, transparent agreement**: a known price, a known
interval, a known set of benefits, ended at will. Every design decision below
exists to keep it exactly that — and to make the dark-pattern subscription
(easy in, mazelike out, surprise charges) structurally impossible.

Owned by the proposed `subscription-service` (Go, [ADR 0038](../adr/0038-canonical-go-service-layout.md)).

## 1. The model

```
 Creator
   └── Plan (a creator's subscription offering)
         └── Tier  (e.g. "Supporter", "Member", "Inner Circle")
               ├── price + currency
               ├── billing interval (monthly | annual)
               └── benefits → entitlements
 Subscriber ──holds──▶ Subscription (subscriber × tier, with a lifecycle state)
```

- A **Plan** belongs to a creator; a creator may offer one plan with several
  **Tiers**.
- A **Tier** has a price, currency, interval, and a set of **benefits**, each of
  which maps to an **entitlement** ([entitlements.md](entitlements.md)).
- A **Subscription** is one subscriber's relationship to one tier, with a
  lifecycle state (§3).

## 2. Billing intervals & pricing

- Supported intervals: **monthly** and **annual**. Annual is offered at a
  creator-set discount; the per-period and total prices are both shown plainly.
- A tier's price is **fixed for an active subscription** — a creator raising a
  tier's price does not silently re-price existing subscribers; they are
  notified and may accept or cancel. No surprise increases.
- Multi-currency: a subscriber is billed in their local currency where
  supported ([payment-provider-abstraction.md](payment-provider-abstraction.md));
  the ledger records the transaction currency ([ledger-architecture.md](ledger-architecture.md)).

## 3. Subscription lifecycle

```
              ┌────────────── renew (success) ──────────────┐
              ▼                                              │
 (signup)─▶ active ──▶ past_due ──▶ (recover) active         │
              │           │                                  │
         cancel│          └── exhausted ──▶ canceled          │
              ▼                                  ▲            │
          canceled ◀──────────────────────────────┘           │
              │  (resubscribe)                                 │
              └───────────────────────────────────────────────┘
```

| State      | Meaning                                                                                |
| ---------- | -------------------------------------------------------------------------------------- |
| `active`   | current; entitlements granted                                                          |
| `past_due` | a renewal payment failed; in the grace period (§5); entitlements still granted         |
| `canceled` | ended — by the subscriber, or by exhausted retries; entitlements revoked at period end |

## 4. Renewal logic

- A subscription renews automatically at the interval — this is the _agreement_,
  and the renewal date and amount are always visible to the subscriber.
- **Pre-renewal notice** — the subscriber is notified before a renewal charge,
  especially for annual terms. No silent annual re-bill.
- Renewal is an **idempotent** operation keyed on `(subscription_id, period)` —
  a retried or duplicated renewal never double-charges
  ([resilience.md](resilience.md)).
- A successful renewal accrues creator revenue and emits
  `commerce.subscription.renewed.v1`; a failure moves the subscription to
  `past_due` (§5).

## 5. Grace periods & dunning

When a renewal payment fails, the subscription does **not** snap off:

- it enters `past_due` and a **grace period** begins — entitlements remain
  granted, so a subscriber is not punished for an expired card;
- payment is retried on a **backoff schedule** (dunning), and the subscriber is
  asked, gently and clearly, to update their payment method;
- if the grace period and retries are exhausted, the subscription moves to
  `canceled` and entitlements are revoked at the end of the paid period.

Grace is deliberately generous — the common case is a benign card expiry, not an
intent to leave.

## 6. Cancellation — the anti-dark-pattern core

This section is a hard governance rule, not a guideline:

- **Cancellation is one flow, as easy as signup.** No retention maze, no
  "are you sure" gauntlet, no hiding the button, no forcing a support contact.
- **Cancel takes effect at period end** — the subscriber keeps what they already
  paid for through the period they paid for; no proration clawback of access.
- The subscriber is shown plainly **when access ends** and **that no further
  charge will occur**.
- **Resubscription is easy** — leaving is not punished with friction on return.

A cancellation flow that uses _any_ dark pattern is a release blocker.

## 7. Entitlement coupling

A subscription's benefits are realized as entitlements:

- entering `active` (or `past_due` within grace) → entitlements **granted**;
- reaching `canceled` at period end → entitlements **revoked**;
- a tier change re-maps entitlements atomically.

Entitlement grant/revoke is event-driven and detailed in
[entitlements.md](entitlements.md); subscription state is the _source_, the
entitlement is the _projection_.

## 8. Events

| Event                                             | When                          |
| ------------------------------------------------- | ----------------------------- |
| `commerce.subscription.created.v1`                | a subscription begins         |
| `commerce.subscription.renewed.v1`                | a renewal succeeds            |
| `commerce.subscription.past_due.v1`               | a renewal fails; grace begins |
| `commerce.subscription.canceled.v1`               | a subscription ends           |
| `commerce.entitlement.granted.v1` / `.revoked.v1` | entitlement changes           |

Stream `commerce.events.v1` ([ADR 0036](../adr/0036-event-topology.md)); full
catalog in [economy-events.md](economy-events.md).

## 9. Observability

Subscriber growth, **churn rate**, involuntary churn (failed-payment cancels) vs.
voluntary churn, grace-period recovery rate, renewal success rate. Involuntary
churn is watched closely — a spike usually means a payment-provider or dunning
problem, not subscribers leaving.

## Related documents

- [entitlements.md](entitlements.md) · [payment-provider-abstraction.md](payment-provider-abstraction.md) · [creator-monetization.md](creator-monetization.md) · [economy-events.md](economy-events.md)
