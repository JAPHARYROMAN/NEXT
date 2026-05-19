# notification-service

Push (APNs / FCM), email (transactional), in-app inbox. Routes notification requests, respects per-user preferences and quiet hours.

Owner: `@next-ecosystem/messaging`.

## Public API (GraphQL subgraph)
- `Notification`, `NotificationPreferences`.
- Mutations: `updateNotificationPreferences`, `markNotificationRead`, `markAllRead`.
- Subscriptions: `newNotification`.

## Internal gRPC
- `NotificationService.Send(request) → DeliveryAck` (idempotent on `request_id`).
- `PreferenceService.Get(user_id) → Preferences`

## Events
**Emitted**: `notification.request.created.v1`, `notification.request.delivered.v1`.
**Consumed**: every domain — services request notifications via Kafka, not direct RPC, so the queue absorbs spikes.

## Data
- `notifications`, `preferences`, `device_tokens` in `notification_pg`.
- In-app inbox cache in `notification_redis`.

## Channels
| Channel | Backend |
| --- | --- |
| Push (iOS) | APNs HTTP/2 |
| Push (Android) | FCM HTTP v1 |
| Email | Postmark (transactional) |
| In-app | Postgres + WebSocket fanout |

## SLO
- `Send → delivered P95 < 5 s` · `Inbox read P95 < 50 ms`.

[Runbook](../../docs/runbooks/notification-service.md).
