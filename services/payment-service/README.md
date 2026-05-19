# payment-service

Wallets, tips, subscriptions, payouts. Strict double-entry ledger.

Owner: `@next-ecosystem/payments`. Tier 1 (highest reliability + audit).

## Public API (GraphQL subgraph)
- `Wallet`, `LedgerEntry`, `Subscription`, `Payout` types.
- Mutations: `tip(creatorId, amount)`, `subscribe(planId)`, `requestPayout(amount)`.

## Internal gRPC
- `WalletService.Balance(user_id) → Money`
- `LedgerService.Post(entry) → LedgerEntry` (idempotent on `idempotency_key`).
- `PayoutService.Initiate(creator_id, amount) → Payout`

## Events
**Emitted**: `payment.intent.created.v1`, `payment.intent.succeeded.v1`, `payment.intent.failed.v1`, `payment.payout.initiated.v1`.
**Consumed**: webhooks via `event-gateway` (Stripe / Adyen).

Partition key: `wallet_id`.

## Data
- Double-entry ledger in `payment_pg`: `accounts`, `transactions`, `entries` (debits + credits sum to zero).
- Idempotency keys + processor responses in `payment_pg`.
- Strict ACID; no caching of ledger state.

## SLO
- `Tip P95 < 250 ms` · `Ledger consistency: zero drift quarterly audit`.
- Tier 1: RPO < 1 min, RTO < 15 min.

## Compliance
- PCI scope minimized — no card data touches our infrastructure (Stripe Elements / Apple Pay / Google Pay).
- Audit log retained 7 years; emits `audit.privileged.action.v1` on all mutations.

[Runbook](../../docs/runbooks/payment-service.md).
