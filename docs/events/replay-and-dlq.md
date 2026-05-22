# Replay and DLQ

## DLQ Strategy

Events go to DLQ when:

- envelope JSON is malformed
- schema/category/type validation fails
- ClickHouse writes fail after retry
- consumer processing repeatedly fails

DLQ headers include:

- `next.source_topic`
- `next.dlq_reason`
- `next.error`

## Replay Strategy

Replay is offset and timestamp based:

1. Identify the affected topic, partition range, offsets, and consumer group.
2. Pause the affected consumer if replaying into the original topic.
3. Prefer replay into `replay.<source-topic>.<yyyyMMddHHmm>` for non-idempotent consumers.
4. Reprocess with a dedicated consumer group.
5. Compare counts between source, replay, ClickHouse raw rows, and DLQ.
6. Resume normal consumers only after lag and error rates stabilize.

## Guardrails

- Replay jobs must include operator identity in headers.
- Replay must preserve original `event_id`, `timestamp`, and `idempotency_key`.
- Never mutate payloads during replay; corrective transforms produce a new event.
