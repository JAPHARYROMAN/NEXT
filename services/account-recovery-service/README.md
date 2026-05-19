# account-recovery-service

Lost-passkey, lost-email, lost-device flows. Manages recovery codes + trusted-contact escalations. The single service responsible for "I cannot sign in."

Owner: `@next-ecosystem/identity`. Status: **scaffolded** — real flows in Phase 7 / 8.

## Public API (gRPC)

- `RecoveryService.IssueCodes(user_id)` → 8 single-use recovery codes (shown once)
- `RecoveryService.StartFlow(handle_or_email, kind)` → `RecoveryFlow { id, channel }`
- `RecoveryService.VerifyChallenge(flow_id, challenge)` → state advance
- `RecoveryService.RegisterTrustedContact(user_id, contact_user_id)` → for fallback path

## Events

**Emitted**: `recovery.code.issued.v1`, `recovery.flow.started.v1`, `recovery.flow.completed.v1`, `recovery.flow.abandoned.v1`.
**Consumed**: `auth.credential.rotated.v1` (invalidate active recovery flows when the user already recovered).

## Data

- `recovery_codes` (hashed at rest), `recovery_flows`, `trusted_contacts` in `account_recovery_pg`.

## Flow taxonomy

1. **Recovery code path** — paste a previously-issued single-use code.
2. **Email-out-of-band path** — `notification-auth-service` sends a signed link; verification must come from a known device (cross-checked against `device-graph-service`).
3. **Trusted-contact path** — a previously-designated trusted contact attests via passkey. Highest assurance, slowest.

Hard-disabled paths: SMS, security questions. Both fail under modern threat models.

## SLO

- `IssueCodes P95 < 100 ms` · `Recovery completion rate > 80% within 24h` · `Audit completeness: 100%`.

[Runbook](../../docs/runbooks/account-recovery-service.md) (TBD).
