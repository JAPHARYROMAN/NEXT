# event-gateway

HTTP to Kafka ingress for the NEXT event bus. It accepts service and client-side event envelopes, validates the canonical contract, enriches privacy-safe metadata, authenticates producers, applies per-producer rate limits, enforces idempotency, and publishes to category topics.

Owner: `@next-ecosystem/platform`.

## Public API

- `POST /v1/events`
- `POST /v1/events/batch`
- `GET /health`
- `GET /metrics`

## Security

- Producers are authenticated with `EVENT_PRODUCER_SECRETS=producer=secret,...`.
- Signed requests use `X-NEXT-Timestamp` and `X-NEXT-Signature: sha256=<hmac>` over `<timestamp>.<raw-body>`.
- `EVENT_GATEWAY_ALLOW_UNSIGNED=true` is only for local development and tests.
- Raw IP addresses and user agents are hashed before enrichment.

## Kafka

Events route by `event_category`:

- `identity.events.v1`
- `session.events.v1`
- `media.events.v1`
- `playback.events.v1`
- `creator.events.v1`
- `community.events.v1`
- `recommendation.events.v1`
- `search.events.v1`
- `moderation.events.v1`
- `commerce.events.v1`
- `system.events.v1`

Partition keys prefer `media_id`, `creator_id`, `user_id`, `session_id`, `device_id`, `correlation_id`, then `event_id`.

## Metrics

- `events_received_total`
- `events_published_total`
- `events_rejected_total`
- `kafka_publish_latency_ms`
