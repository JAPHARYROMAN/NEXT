# Payout Architecture

> How earned revenue gets from the ledger into a creator's hands — accounts,
> balances, schedules, the reserves and holds that protect against fraud, and
> the failure handling that ensures a payout is never lost.

## 0. Principle

A payout is the moment NEXT keeps its core promise to creators. So payouts are
designed to be **predictable, transparent, and safe**: a creator knows what they
have, when it pays, and why anything is held — and a payout, once owed, is never
silently lost. Owned by the proposed `payout-service` (Go).

## 1. Balances

A creator's revenue, projected from the ledger
([ledger-architecture.md](ledger-architecture.md)), exists in three states:

| Balance               | Meaning                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| **Accrued (pending)** | revenue earned but still inside the chargeback/refund window of its originating payment — not yet payable |
| **Available**         | cleared revenue, payable at the next scheduled payout                                                     |
| **On hold**           | available revenue withheld by a specific, disclosed reason (§5)                                           |

Revenue flows `accrued → available → (paid out)`, with `on hold` as a possible
disclosed detour. The creator sees all three and the reason behind any hold —
no silent withholding.

## 2. Payout accounts

- A creator registers a **payout destination** — a bank account, a wallet, or a
  mobile-money number ([payment-provider-abstraction.md](payment-provider-abstraction.md)).
- Payout account details are **sensitive** — stored via the provider's tokenized
  payout-account mechanism where available, encrypted, least-privilege access,
  redacted in logs and traces.
- A payout account requires **verification** before first payout (provider-side
  account verification) — this is also a fraud control (§6).
- Regional reach: payouts support bank transfer, wallets, and **mobile money** —
  first-class for mobile-first markets.

## 3. Payout schedules

- Payouts run on a **regular schedule** (e.g. a fixed cadence) once a creator's
  available balance clears a small minimum threshold.
- The schedule and the next payout date are always visible to the creator.
- A creator may also see a forecast: pending revenue and its expected clear
  dates.
- Predictability is the point — a creator running a media business
  ([docs/roadmap/creator-economy-evolution.md](../roadmap/creator-economy-evolution.md))
  needs to know when they are paid.

## 4. Chargeback reserves

Because a viewer can charge back a payment _after_ the creator has been paid, a
portion of accrued revenue feeds a **`chargeback_reserve`** account
([ledger-architecture.md](ledger-architecture.md) §1):

- the reserve is a small, **disclosed** percentage held against future
  chargebacks/refunds;
- a chargeback draws on the reserve first, so a normal chargeback does not claw
  back from a creator's available balance;
- reserve held and reserve released are visible to the creator — it is a
  transparent buffer, not a hidden cut.

## 5. Payout holds

A payout (or a portion) can be **held** — but only for a specific, disclosed,
appealable reason:

| Hold reason                          | Why                                                                                               |
| ------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Identity / payout-account unverified | the destination is not yet confirmed safe                                                         |
| Active fraud-risk case               | a `fraud-risk-service` signal is open ([fraud-risk.md](fraud-risk.md))                            |
| Trust & safety enforcement           | an upheld violation with a monetization consequence                                               |
| Tax-form incomplete                  | a required tax form is missing ([tax-compliance-architecture.md](tax-compliance-architecture.md)) |
| Chargeback spike                     | abnormal chargeback rate pending investigation                                                    |

Every hold: is **disclosed** to the creator with the reason; is **time-bounded
or condition-bounded** (it states what clears it); and is **appealable** through
the financial appeal flow — the same explainable-recourse doctrine as moderation
appeals ([docs/trust-safety/appeals-system.md](../trust-safety/appeals-system.md)).
There is no indefinite, unexplained withholding.

## 6. Payout fraud controls

Payout is a fraud target (a fraudster wants money _out_). Controls, integrated
with [fraud-risk.md](fraud-risk.md):

- payout-account verification before first payout;
- anomaly checks — a sudden payout-account change, a mismatch between earning
  pattern and payout pattern, a new account draining fast;
- a `fraud-risk-service` signal places a payout hold (§5) pending review;
- step-up identity confirmation on a payout-account change.

The bias: **friction, then review** — a suspicious payout is _held and reviewed_,
not silently confiscated; a false positive is a brief, explained delay.

## 7. Payout execution & failure handling

```
 payout scheduled ──▶ payout-service builds the batch ──▶ provider Payout call
        │                                                       │
   commerce.payout.scheduled.v1                          success │ failure
                                                                 ▼
                                          commerce.payout.completed.v1
                                                    or  commerce.payout.failed.v1 ──▶ retry / notify
```

- A payout moves funds `creator_revenue → payout_clearing → (provider) → creator`
  as ledger transactions; `payout_clearing` holds funds in flight.
- Payout calls are **idempotent** (`payout:<payout_id>`) — a retry never double-pays.
- **Failure handling** — a failed payout (bad account, provider error) is
  **retried** with backoff; persistent failure notifies the creator to fix their
  payout account and the funds **return to `available`** — they are never lost.
- A payout is only marked complete on a confirmed provider result (webhook +
  reconciliation, [resilience.md](resilience.md)).

## 8. The audit ledger

Every payout — scheduled, held, completed, failed, retried — is an immutable
ledger transaction and an immutable event. The payout history is permanent and
reconcilable: NEXT can always show, for any creator and any period, exactly what
was earned, what was held and why, and what was paid.

## 9. Observability

Payout latency (available → paid), payout success/failure rate, retry rate,
held-payout volume and average hold duration, reserve held vs. released,
reconciliation drift on payouts. A rising hold duration or failure rate is
investigated — a creator waiting on money is a priority signal.

## Related documents

- [ledger-architecture.md](ledger-architecture.md) · [fraud-risk.md](fraud-risk.md) · [tax-compliance-architecture.md](tax-compliance-architecture.md) · [resilience.md](resilience.md) · [economy-events.md](economy-events.md)
