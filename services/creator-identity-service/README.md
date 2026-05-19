# creator-identity-service

Creator-tier identity. Owns the creator record, verification state, KYC integration (Phase 9), payout-ready identity assertions for `payment-service`.

Owner: `@next-ecosystem/creator`. Status: **scaffolded** — first real flows in Phase 7.

## Public API (gRPC)

- `CreatorService.Upgrade(user_id, profile_input)` → links a `User` to a `Creator` record
- `CreatorService.GetCreator(user_id)` → `Creator` aggregate
- `CreatorService.UpdatePayoutInfo(creator_id, encrypted_blob)` → field-level encrypted
- `CreatorService.StartVerification(creator_id, kind)` → returns the verification workflow id
- `CreatorService.GetVerificationStatus(creator_id)` → state machine view

## Events

**Emitted**: `creator.upgraded.v1`, `creator.verified.v1`, `creator.payout_info_updated.v1`.
**Consumed**: `auth.user.registered.v1` (lazy bind), `payment.payout.initiated.v1` (audit cross-check).

## Data

- `creators`, `kyc_state`, `payout_methods` in `creator_identity_pg`.
- Payout method PII field-encrypted via Vault Transit.

## Cross-service flow (Phase 7)

1. User clicks "Become a creator" in `apps/studio`.
2. `CreatorService.Upgrade` → emits `creator.upgraded.v1`.
3. `profile-service` consumes, updates `tier` to `creator`, emits `profile.user.updated.v1`.
4. `access-control-service` reconfigures the tier's scope set.

## SLO

- `Upgrade P95 < 200 ms` · `Verification flow availability > 99.9%` · `KYC compliance audit completeness: 100%`.

[Runbook](../../docs/runbooks/creator-identity-service.md) (TBD).
