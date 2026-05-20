# Ledger Architecture

> The financial source of truth for NEXT. Every cent that moves is a balanced,
> append-only, double-entry transaction. The ledger is the one place that can
> answer "where is the money" — and its answer always reconciles.

## 0. Principle

The ledger is built on accounting's oldest, most battle-tested idea:
**double-entry**. Every transaction debits one or more accounts and credits
others by an **equal total** — money is never created or destroyed, only moved.
A ledger that always balances is a ledger that cannot silently lose money.

Three non-negotiables:

1. **Append-only.** A ledger entry is never edited or deleted. A correction is a
   _new_ compensating transaction. The history is permanent.
2. **Balanced.** Every transaction's debits equal its credits. An unbalanced
   transaction is rejected — it is a bug, by definition.
3. **Idempotent.** Every transaction is keyed; replaying it is a no-op. Money is
   moved exactly once even when events are delivered more than once.

Owned by the proposed `creator-revenue-service` (Go, [ADR 0038](../adr/0038-canonical-go-service-layout.md)).

## 1. Accounts

The ledger is a set of **accounts**; money lives in accounts and moves between
them. Account kinds:

| Account kind         | Holds                                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| `user_funds`         | a paying user's inbound payment, momentarily                                                              |
| `platform_fee`       | NEXT's transparent revenue share                                                                          |
| `processing_fee`     | pass-through payment-provider fees                                                                        |
| `creator_revenue`    | a creator's earned revenue (pending → available)                                                          |
| `chargeback_reserve` | funds held against potential chargebacks                                                                  |
| `tax_collected`      | tax collected on behalf of authorities ([tax-compliance-architecture.md](tax-compliance-architecture.md)) |
| `payout_clearing`    | funds in flight to a creator's payout destination                                                         |
| `refund_clearing`    | funds in flight back to a user                                                                            |

Every account has a currency; cross-currency movement is explicit (§5).

## 2. A transaction is balanced

Example — a viewer pays for a $10 premium video:

```
Transaction  txn:purchase:<order_id>     (idempotency key)
  debit   user_funds            $10.00
  credit  processing_fee         $0.30   (provider's pass-through fee)
  credit  platform_fee           $0.97   (NEXT's stated share)
  credit  creator_revenue        $8.73   (the creator's earning, pending)
  ─────────────────────────────────────
  debits  $10.00  ==  credits  $10.00    ✓ balanced
```

The transaction is rejected unless debits equal credits. The creator can later
see _exactly_ this breakdown — the split is not a mystery
([creator-monetization.md](creator-monetization.md) §2).

## 3. Conceptual schema

Two core tables in the `creator-revenue` Postgres database:

```
accounts
  id · owner_id · owner_kind (creator|platform|user|system) · kind · currency · created_at

ledger_entries          -- append-only; never updated or deleted
  id · transaction_id · account_id · direction (debit|credit)
  amount · currency · created_at
  -- a transaction_id groups the entries of one balanced transaction

transactions            -- the header; idempotency lives here
  id · idempotency_key (unique) · kind · status · external_ref · created_at
```

`ledger_entries` is strictly append-only — enforced (no `UPDATE`/`DELETE` grant
on it). A balance is the **sum of an account's entries**, optionally snapshotted
for performance, never stored as a mutable field.

## 4. Idempotency

- Every transaction has a unique **idempotency key** derived from the business
  operation (`purchase:<order_id>`, `renewal:<sub_id>:<period>`,
  `refund:<payment_id>`, `payout:<payout_id>`).
- Writing a transaction whose key already exists **returns the existing
  transaction** — it does not write a second one.
- This is what makes the economy safe under at-least-once event delivery
  ([economy-events.md](economy-events.md)) and provider webhook re-delivery
  ([payment-provider-abstraction.md](payment-provider-abstraction.md) §6) — the
  same financial fact, arriving twice, moves money once.

## 5. Currency

- Every account, entry, and transaction carries an explicit currency.
- A transaction's debits and credits balance **within a currency** — a
  cross-currency operation (e.g. a payout converting held USD to local currency)
  is modeled as an explicit FX transaction with both legs and the rate recorded,
  so the books balance in _each_ currency and the conversion is auditable.
- Amounts are integer minor units (cents) — never floats — to eliminate rounding
  drift.

## 6. Refunds & chargebacks

- A **refund** is a new compensating transaction — it does not erase the
  original. It moves funds from `creator_revenue` (or `chargeback_reserve`) and
  `platform_fee` back through `refund_clearing` to the user. The original
  purchase transaction stays in the ledger, permanently.
- A **chargeback** (a provider-initiated reversal) is likewise a new
  transaction, drawing first on the `chargeback_reserve`
  ([payouts.md](payouts.md)).
- Because corrections are new transactions, the ledger's history shows the full
  story — purchase, then refund — never a rewritten past.

## 7. Reconciliation

The ledger is continuously checked against reality:

- **Internal invariant check** — every transaction balances; the sum of all
  entries across all accounts of a currency is conserved. A periodic job asserts
  this; a violation is a P0 incident.
- **Provider reconciliation** — the ledger is reconciled against payment-provider
  settlement reports: every captured payment, refund, and payout in the provider's
  records has a matching ledger transaction, and vice versa.
- **Reconciliation drift** is a tracked metric ([economy-events.md](economy-events.md));
  the target is zero. Non-zero drift triggers investigation before it compounds.

## 8. The ledger and the event log

Every ledger transaction emits an immutable financial event to
`commerce.events.v1` ([economy-events.md](economy-events.md)). The relationship:

- the **ledger** is the authoritative financial state;
- the **event log** is the durable, replayable record of every state change;
- the ledger is itself **rebuildable** by replaying its transaction events into a
  fresh store ([docs/resilience/event-stream-resilience.md](../resilience/event-stream-resilience.md))
  — the same property that protects every derived store in NEXT, applied to the
  most important one.

## 9. Access & audit

- Write access to the ledger is **least-privilege** — only `creator-revenue-service`
  writes entries, and only via balanced transactions.
- Every financial admin action is audited (`audit.events.v1`).
- The ledger is the evidentiary base for transparency, creator revenue views,
  tax reporting, and any financial dispute.

## Related documents

- [payouts.md](payouts.md) · [payment-provider-abstraction.md](payment-provider-abstraction.md) · [tax-compliance-architecture.md](tax-compliance-architecture.md) · [economy-events.md](economy-events.md) · [resilience.md](resilience.md)
