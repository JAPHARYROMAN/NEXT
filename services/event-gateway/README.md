# event-gateway

External webhooks ↔ Kafka bridge. Receives webhooks from Stripe, Apple, Google, partners; publishes idempotent events onto Kafka. Outbound webhooks for partner-app integrations.

Owner: `@next-ecosystem/platform`.

## Public API
- `POST /webhooks/stripe`
- `POST /webhooks/apple/server-notifications`
- `POST /webhooks/fcm/feedback`
- `POST /webhooks/partner/:partner_id`

## Internal gRPC
- `WebhookService.Deliver(target, payload) → Ack` (outbound).

## Events
**Emitted**: domain events derived from webhooks (e.g. Stripe `charge.succeeded` → `payment.intent.succeeded.v1`).
**Consumed**: outbound subscriber events.

## Data
- Idempotency keys in `event_gateway_pg`.
- Outbound delivery state machine (`pending`, `delivered`, `failed`, `dropped`) per partner.

## SLO
- `Webhook accept P95 < 100 ms` · `Translate → Kafka publish P95 < 500 ms` · `Outbound retry success > 99 %` (within 24 h).

## Security
- Signature verification (HMAC) per partner; mismatched signatures rejected and logged as security events.
- IP allowlist + WAF rules per partner.

[Runbook](../../docs/runbooks/event-gateway.md).
