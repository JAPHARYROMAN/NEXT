# Payment Provider Abstraction

> NEXT processes money through external payment providers — but is never
> _owned_ by one. This document defines the abstraction that keeps providers
> swappable, failover-able, and regionally expandable, with raw card data never
> touching NEXT.

## 0. Principle

A payments platform that hard-codes one provider inherits that provider's
outages, that provider's regional gaps, and that provider's pricing leverage.
NEXT instead defines a **provider-agnostic boundary**: the platform speaks one
internal payment contract; an adapter per provider translates it. No provider
lock-in, provider failover, and regional expansion by adding adapters.

No real provider credentials are configured in this phase — this is the
architecture only.

## 1. The abstraction

```
 payment-service
   └── PaymentProvider (internal interface)
         ├── StripeAdapter
         ├── AdyenAdapter
         ├── PayPalAdapter
         └── MobileMoneyAdapter(s)   ── regional
```

The `PaymentProvider` interface is the **only** thing the rest of NEXT's economy
knows about. Conceptually it covers:

| Capability      | Purpose                                                                     |
| --------------- | --------------------------------------------------------------------------- |
| `Authorize`     | reserve funds on a payment method                                           |
| `Capture`       | settle an authorized amount                                                 |
| `Refund`        | return a captured amount                                                    |
| `Tokenize`      | exchange a payment method for a provider token (NEXT stores only the token) |
| `Payout`        | send funds to a creator's payout destination ([payouts.md](payouts.md))     |
| `HandleWebhook` | normalize a provider's async callback into an internal event                |

Every adapter implements this contract; provider-specific complexity (APIs,
quirks, webhook formats, error taxonomies) is **contained inside the adapter**
and never leaks into `payment-service` or beyond.

## 2. Supported & planned providers

| Provider                                       | Role                                                           | Status                     |
| ---------------------------------------------- | -------------------------------------------------------------- | -------------------------- |
| **Stripe**                                     | primary card processing                                        | designed                   |
| **Adyen**                                      | alternate card processing; broad regional reach                | designed                   |
| **PayPal**                                     | wallet payment method                                          | designed                   |
| **Mobile money** (e.g. M-Pesa-class providers) | regional — critical for African and other mobile-first markets | designed, regional rollout |
| Regional processors                            | market-by-market expansion                                     | adapter-per-market         |

Mobile money is **first-class**, not an afterthought — consistent with NEXT's
Africa-as-launch-region commitment ([docs/roadmap/global-expansion.md](../roadmap/global-expansion.md)).
A market where cards are rare is a market NEXT serves with the right adapter.

## 3. Provider routing

`payment-service` chooses an adapter per transaction by a **routing policy**:

- **Region / method** — the viewer's region and chosen method select the
  capable provider (a mobile-money payment routes to a mobile-money adapter).
- **Health** — an unhealthy provider is routed around (§4).
- **Cost / success-rate** — among capable, healthy providers, routing can favor
  the one with the better observed success rate and cost for that corridor.

Routing is policy, not hard-coded — adding a provider or a market is a config +
adapter change, not a `payment-service` rewrite.

## 4. Failover

Because no single provider is load-bearing:

- a provider failing health checks is **drained** from routing;
- an in-flight authorization that fails on a transient provider error can be
  **retried on an alternate** capable provider (idempotency keys, §6, make this
  safe);
- failover is per-transaction and automatic; a provider outage is a degraded
  success rate for a corridor, not a payments outage
  ([resilience.md](resilience.md)).

## 5. The PCI boundary — NEXT never sees raw cards

- Raw card data (PAN) is captured **client-side directly by the provider's
  SDK/element** and exchanged for a **provider token**. It never transits or
  rests on a NEXT server.
- NEXT stores **only provider tokens** — opaque references — keyed to a user's
  saved payment methods.
- This **minimizes PCI scope** to the provider boundary: NEXT handles tokens and
  ledger entries, not card numbers.
- Provider API credentials live in Vault + External Secrets
  ([ADR 0010](../adr/0010-secrets.md)); none are committed to the repo.

## 6. Idempotency

Every money-moving call carries an **idempotency key** — derived from the
business operation (`charge:<order_id>`, `renewal:<subscription_id>:<period>`):

- the key is passed to the provider (providers support idempotency keys) **and**
  recorded by `payment-service` in Redis/Postgres;
- a retried call — after a timeout, a crash, a failover — with the same key
  returns the original result instead of charging again;
- this is what makes retries (§4, [resilience.md](resilience.md)) and webhook
  re-delivery safe. **Double-charging a user is treated as a severe defect**,
  and idempotency is the structural prevention.

## 7. Webhooks

Providers report asynchronous outcomes (a delayed capture, a dispute, a payout
result) by webhook. The abstraction normalizes them:

- each adapter's `HandleWebhook` **verifies the provider's signature**, then
  translates the provider event into a normalized internal economy event
  ([economy-events.md](economy-events.md));
- webhooks are processed **idempotently** — providers re-deliver, and re-delivery
  must be a no-op;
- a late or missed webhook is backstopped by the **reconciliation job**
  ([resilience.md](resilience.md)) that polls provider state — NEXT never relies
  on a webhook _alone_ for a financial fact.

## 8. Adding a provider or a market

The whole point of the abstraction: expansion is **additive**.

1. Write an adapter implementing `PaymentProvider`.
2. Add it to the routing policy for its regions/methods.
3. No change to `payment-service` core, the ledger, or any consumer.

A new market is an adapter; it is not a project.

## 9. Observability

Per provider and per corridor: authorization success rate, capture success
rate, latency, failover rate, webhook lag. A provider's success rate dropping is
an early signal that routing should shift weight away from it.

## Related documents

- [ledger-architecture.md](ledger-architecture.md) · [payouts.md](payouts.md) · [resilience.md](resilience.md) · [economy-events.md](economy-events.md) · [platform-economy-architecture.md](platform-economy-architecture.md)
