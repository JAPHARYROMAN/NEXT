# notification-auth-service

Out-of-band authentication notifications: push challenges, email confirmations, device approvals. The "tap to approve" surface.

Owner: `@next-ecosystem/identity` + `@next-ecosystem/messaging`. Status: **scaffolded** — real flows in Phase 7.

## Public API (gRPC)

- `NotificationAuthService.PushChallenge(user_id, action, ttl)` → returns `challenge_id`. Out-of-band push asks the user to approve on a trusted device.
- `NotificationAuthService.VerifyChallenge(challenge_id, approval_token)` → `Approved | Denied | Expired`
- `NotificationAuthService.SendConfirmation(user_id, kind, channel)` → email confirm
- `NotificationAuthService.CancelChallenge(challenge_id)` → caller-cancel

## Events

**Emitted**: `notification_auth.challenge.requested.v1`, `notification_auth.challenge.completed.v1`.
**Consumed**: `auth.session.started.v1` (anomalies → step-up), `device.anomaly_detected.v1`.

## Data

- `challenges`, `delivery_log` in `notification_auth_pg`.
- Challenges are short-lived (≤ 2 min default). Approval requires a trusted device.

## Cross-service flow (Phase 7)

1. High-risk action at the gateway (e.g. payout request).
2. Gateway holds the request and calls `NotificationAuthService.PushChallenge`.
3. User taps Approve in `apps/mobile`. Approval verified by passkey on the trusted device.
4. Gateway resumes the held request.

## SLO

- `PushChallenge P95 < 80 ms` · `Approval round-trip P75 < 10 s` (UX target).

[Runbook](../../docs/runbooks/notification-auth-service.md) (TBD).
