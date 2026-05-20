# Economy Resilience

> How the NEXT economy survives provider outages, lost webhooks, and partial
> failures — without losing money, double-charging anyone, or letting a
> commerce problem break core playback.

## 0. Principle

The economy inherits NEXT's platform resilience doctrine
([docs/resilience](../resilience/README.md)) and adds the rules specific to
money. Three economy-specific invariants:

1. **Never lose money, never double-move money.** Idempotency
   ([ledger-architecture.md](ledger-architecture.md) §4) makes every financial
   operation exactly-once in effect, even when delivered at-least-once.
2. **Reconcile, always.** NEXT never trusts a single signal for a financial
   fact — provider state, the ledger, and the event log are continuously
   reconciled.
3. **Commerce degrades; playback does not.** A failure in the economy can slow
   or degrade commerce — it can **never** break core (free) playback.

## 1. Payment-provider outage handling

When a payment provider degrades or fails:

- **Failover** — `payment-service` routes around the unhealthy provider to an
  alternate capable provider for the corridor
  ([payment-provider-abstraction.md](payment-provider-abstraction.md) §4); a
  provider outage is a degraded success rate, not a payments outage.
- **No capable provider** — if every provider for a corridor is down, payment
  attempts fail **cleanly and honestly** — the user sees "payment is temporarily
  unavailable, your card was not charged", never an ambiguous or broken state.
- **Subscriptions ride it out** — a renewal that cannot be processed during an
  outage enters the normal grace/dunning path
  ([subscription-architecture.md](subscription-architecture.md) §5); the
  subscriber is not cancelled for a platform-side outage.

## 2. Idempotent retries

- Every money-moving operation is keyed and retry-safe (§0, invariant 1).
- A transient failure — a timeout, a dropped connection, a failover — is
  **retried with backoff** under the same idempotency key; the retry either
  completes the original operation or returns its already-recorded result.
- A retry **never** produces a second charge, a second ledger transaction, or a
  second payout. This is asserted by tests and watched by reconciliation (§4).

## 3. Delayed & missing webhooks

Provider webhooks ([payment-provider-abstraction.md](payment-provider-abstraction.md) §7)
are asynchronous and unreliable:

- webhooks are processed **idempotently** — a re-delivered webhook is a no-op;
- a **late** webhook is still processed correctly when it arrives (idempotency
  makes ordering forgiving);
- a **missing** webhook is caught by the reconciliation job (§4) — NEXT never
  relies on a webhook _alone_ to learn a financial outcome; it also polls
  provider state.

The rule: a webhook is an _optimization_ (fast notification), never the _only_
source of a financial fact.

## 4. Reconciliation jobs

Reconciliation is the economy's continuous self-audit:

- **Internal** — every ledger transaction balances; value is conserved per
  currency across all accounts ([ledger-architecture.md](ledger-architecture.md) §7).
- **Provider** — the ledger is matched against payment-provider settlement
  reports: every captured payment, refund, and payout on each side has a
  counterpart on the other.
- **Entitlement** — entitlements are re-derived from authoritative
  subscription/purchase state and any cache/store drift is corrected
  ([entitlements.md](entitlements.md) §4).
- **Drift** is a tracked metric; the target is zero. Non-zero drift triggers
  investigation before it compounds — a small unexplained discrepancy today is a
  large one next quarter.

Reconciliation is what turns "we think the books are right" into "we have
verified the books are right".

## 5. Payout retry

- A failed payout is **retried with backoff** ([payouts.md](payouts.md) §7).
- Persistent failure (e.g. a bad payout account) returns the funds to the
  creator's **available** balance — never lost — and notifies the creator to fix
  the destination.
- A payout is marked complete only on a **confirmed** provider result (webhook +
  reconciliation), never optimistically.

## 6. Graceful commerce degradation

When an economy subsystem is degraded, behavior is explicitly designed
([docs/resilience/graceful-degradation.md](../resilience/graceful-degradation.md)):

| Subsystem degraded         | Behavior                                                                                                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Entitlement system**     | core/free content **always plays**; premium falls back to last cached entitlement, else fails closed _gracefully_ (deny + honest retry message) — [entitlements.md](entitlements.md) §5 |
| **payment-service**        | new purchases/subscriptions fail cleanly ("not charged"); existing entitlements and playback unaffected                                                                                 |
| **payout-service**         | payouts queue and run when recovered; no payout is lost; earning continues to accrue                                                                                                    |
| **ledger**                 | money-moving operations pause and buffer (events are durable in Kafka); they drain to the ledger on recovery — no event lost                                                            |
| **sponsorship / commerce** | campaign and storefront operations degrade; media playback and free experience unaffected                                                                                               |

## 7. The hard rule: commerce never breaks playback

Stated on its own because it is the most important:

> **Core playback has no dependency on the economy.** Free content does not run
> an entitlement check at all. A total economy outage — every economy service
> down — leaves NEXT a fully working free video platform. Premium features
> degrade; the platform does not.

This is enforced architecturally: the playback path does not call economy
services for free content, and the entitlement check on premium content is
designed to fail gracefully ([entitlements.md](entitlements.md) §5), not to
block.

## 8. Event durability

`commerce.events.v1` is the zero-loss event tier — `acks=all`, RF3,
cross-region mirrored ([economy-events.md](economy-events.md),
[docs/resilience/event-stream-resilience.md](../resilience/event-stream-resilience.md)).
A financial event is never lost; if a consumer is down, events buffer durably in
Kafka and drain on recovery. The ledger is rebuildable from this stream — the
ultimate backstop.

## 9. Observability

Payment success/failure rate (per provider), provider-failover rate, webhook
lag, **reconciliation drift** (the headline integrity metric), payout
latency/failure/retry rate, entitlement-check latency and degraded-mode rate,
refund and chargeback rates. Reconciliation drift trending non-zero is a P1
signal — the books drifting is the one thing the economy cannot tolerate.

## Related documents

- [ledger-architecture.md](ledger-architecture.md) · [payment-provider-abstraction.md](payment-provider-abstraction.md) · [entitlements.md](entitlements.md) · [payouts.md](payouts.md) · [economy-events.md](economy-events.md)
- [docs/resilience/README.md](../resilience/README.md)
