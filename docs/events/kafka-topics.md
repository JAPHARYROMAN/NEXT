# Kafka Topics

Infrastructure definitions live in `infrastructure/kafka/topics.yaml`.

## Category Topics

| Topic                      | Partition key  | Retention |
| -------------------------- | -------------- | --------- |
| `identity.events.v1`       | `user_id`      | 7 days    |
| `session.events.v1`        | `session_id`   | 7 days    |
| `media.events.v1`          | `media_id`     | 30 days   |
| `playback.events.v1`       | `media_id`     | 7 days    |
| `creator.events.v1`        | `creator_id`   | 30 days   |
| `community.events.v1`      | `community_id` | 30 days   |
| `recommendation.events.v1` | `user_id`      | 7 days    |
| `search.events.v1`         | `user_id`      | 7 days    |
| `moderation.events.v1`     | `media_id`     | 30 days   |
| `commerce.events.v1`       | `user_id`      | 30 days   |
| `system.events.v1`         | `service_name` | 7 days    |

## DLQ Topics

- `identity.events.dlq.v1`
- `media.events.dlq.v1`
- `playback.events.dlq.v1`
- `analytics.events.dlq.v1`

## Producer Settings

- `acks=all`
- idempotent producer semantics where supported
- no auto topic creation
- bounded retries with OTel spans
- W3C trace context headers

## Consumer Groups

`analytics-service-v1` consumes every category topic. Consumers must be idempotent and commit offsets only after durable downstream write or successful DLQ publish.
