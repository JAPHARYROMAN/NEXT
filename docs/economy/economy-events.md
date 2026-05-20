# Economy Event Architecture

> Every meaningful financial action emits an event. The event log is the
> durable, replayable, immutable record of the NEXT economy — the backbone the
> ledger, analytics, fraud detection, and reconciliation all build on.

## 0. Principle

Financial events are the **highest-durability events in NEXT** — they belong to
the zero-loss tier ([docs/resilience/event-stream-resilience.md](../resilience/event-stream-resilience.md)
§7). They are immutable, idempotent, and replayable. The ledger
([ledger-architecture.md](ledger-architecture.md)) and every analytical and
risk system are derived from this stream; losing or duplicating a financial
event is unacceptable, so the architecture makes both impossible.

## 1. Stream & conventions

- **Stream**: `commerce.events.v1` — the canonical category stream
  ([ADR 0036](../adr/0036-event-topology.md)); per-event types travel in the
  envelope, not as separate topics.
- **DLQ**: `commerce.events.dlq.v1`.
- **Schema**: every payload is a Protobuf message under
  `packages/events/schemas/commerce/v1/` ([ADR 0039](../adr/0039-event-schema-source-of-truth.md)).
- **Durability**: zero-loss tier — `acks=all`, RF3
  ([docs/resilience/event-stream-resilience.md](../resilience/event-stream-resilience.md)).
- **Idempotency**: every financial event carries an idempotency key (the
  business-operation key, §3); consumers are idempotent.
- **Partition key**: by the entity whose ordering matters — typically
  `creator_id` for revenue/payout events, `user_id` for purchase/subscription
  events, `transaction_id` for ledger events.

## 2. The event catalog

| Event                                           | Producer                           | Key consumers                                    |
| ----------------------------------------------- | ---------------------------------- | ------------------------------------------------ |
| `commerce.payment.authorized.v1`                | payment-service                    | ledger, fraud-risk                               |
| `commerce.payment.succeeded.v1`                 | payment-service                    | ledger, commerce, subscription, fraud-risk       |
| `commerce.payment.failed.v1`                    | payment-service                    | subscription (dunning), notification, fraud-risk |
| `commerce.refund.created.v1`                    | payment-service / commerce-service | ledger, entitlements, fraud-risk                 |
| `commerce.chargeback.received.v1`               | payment-service                    | ledger, fraud-risk, payouts                      |
| `commerce.subscription.created.v1`              | subscription-service               | entitlements, creator-revenue, analytics         |
| `commerce.subscription.renewed.v1`              | subscription-service               | ledger, creator-revenue, analytics               |
| `commerce.subscription.past_due.v1`             | subscription-service               | notification, entitlements                       |
| `commerce.subscription.canceled.v1`             | subscription-service               | entitlements, analytics                          |
| `commerce.entitlement.granted.v1`               | commerce / subscription-service    | entitlement cache, content path, audit           |
| `commerce.entitlement.revoked.v1`               | commerce / subscription-service    | entitlement cache, content path, audit           |
| `commerce.order.completed.v1`                   | commerce-service                   | ledger, entitlements, creator-revenue            |
| `commerce.creator_revenue.accrued.v1`           | creator-revenue-service            | payouts, analytics, creator dashboard            |
| `commerce.ledger.transaction.recorded.v1`       | creator-revenue-service            | analytics, reconciliation, audit                 |
| `commerce.payout.scheduled.v1`                  | payout-service                     | ledger, notification                             |
| `commerce.payout.completed.v1`                  | payout-service                     | ledger, creator dashboard, audit                 |
| `commerce.payout.failed.v1`                     | payout-service                     | notification, payouts (retry), fraud-risk        |
| `commerce.payout.held.v1`                       | payout-service                     | notification, creator dashboard                  |
| `commerce.sponsorship.campaign_created.v1`      | sponsorship-service                | creator discovery, analytics                     |
| `commerce.sponsorship.campaign_accepted.v1`     | sponsorship-service                | ledger (escrow), analytics                       |
| `commerce.sponsorship.deliverable_submitted.v1` | sponsorship-service                | brand notification                               |
| `commerce.sponsorship.deliverable_approved.v1`  | sponsorship-service                | ledger (escrow release), creator-revenue         |
| `commerce.sponsorship.dispute_opened.v1`        | sponsorship-service                | fraud-risk, review                               |
| `commerce.tax.calculated.v1`                    | tax-compliance-service             | ledger, analytics                                |
| `commerce.invoice.generated.v1`                 | tax-compliance-service             | notification, audit                              |
| `commerce.fraud_risk.detected.v1`               | fraud-risk-service                 | payouts, trust-service, moderation               |

A cross-stream note: `fraud-risk-service` also emits `trust.fraud_risk.detected.v1`
on `trust.events.v1` ([docs/trust-safety/risk-intelligence.md](../trust-safety/risk-intelligence.md))
— the financial finding and the trust signal are distinct events on their
respective streams.

## 3. Idempotency requirements

Idempotency is mandatory, not optional, on financial events:

- every event carries an **idempotency key** = the business-operation key
  (`purchase:<order_id>`, `renewal:<sub_id>:<period>`, `refund:<payment_id>`,
  `payout:<payout_id>`);
- ledger consumers key transactions on it — a re-delivered event moves money
  **zero** additional times ([ledger-architecture.md](ledger-architecture.md) §4);
- entitlement consumers key grants/revokes on it — re-delivery is a no-op
  ([entitlements.md](entitlements.md));
- this is what makes at-least-once delivery, provider webhook re-delivery, and
  replay all **safe**.

## 4. Replay

Financial events are **replayable**, and replay is a designed capability:

- the **ledger is rebuildable** by replaying `commerce.ledger.transaction.recorded.v1`
  - the source events into a fresh store — the resilience property of every
    derived store in NEXT, applied to the most critical one;
- **reconciliation** ([resilience.md](resilience.md)) replays/reads history to
  verify the ledger against provider settlement records;
- **analytics backfill** — ClickHouse revenue analytics are (re)built by
  replaying the stream;
- replay is safe **because** consumers are idempotent (§3) — replaying a
  financial event never re-moves money.

## 5. Producers & consumers

- **Producers** are the eight economy services
  ([platform-economy-architecture.md](platform-economy-architecture.md) §3) —
  each emits within its own domain.
- **Consumers**: the ledger (the central consumer), the entitlement system,
  `fraud-risk-service`, ClickHouse analytics, the audit sink, the creator
  dashboard projections, and `notification-service`.
- Event ownership follows service ownership — a service emits events for its own
  domain and never another's.

## 6. Analytics

`commerce.events.v1` feeds ClickHouse ([ADR 0035](../adr/0035-clickhouse-analytics-warehouse.md))
for revenue analytics, creator monetization analytics, subscription churn, and
sponsorship analytics — see the observability sections of the domain docs. The
analytical store is derived and rebuildable; the ledger remains the financial
source of truth.

## Related documents

- [ledger-architecture.md](ledger-architecture.md) · [resilience.md](resilience.md) · [ADR 0036](../adr/0036-event-topology.md) · [ADR 0039](../adr/0039-event-schema-source-of-truth.md) · [docs/resilience/event-stream-resilience.md](../resilience/event-stream-resilience.md)
