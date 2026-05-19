import type { Tier } from '@next/identity-types';

/**
 * Scopes are dot-separated `<domain>:<action>` strings. The access-control PDP
 * resolves these to allow/deny per request. This file is the canonical catalog
 * so typos at call sites become compile errors.
 */
export const Scopes = {
  // ---- Profile ----
  ProfileRead: 'profile:read',
  ProfileWriteSelf: 'profile:write_self',
  ProfileWriteAny: 'profile:write_any',
  // ---- Social ----
  FollowWrite: 'social:follow',
  // ---- Media ----
  VideoUpload: 'video:upload',
  VideoPublish: 'video:publish',
  VideoDelete: 'video:delete_self',
  VideoDeleteAny: 'video:delete_any',
  // ---- Live ----
  LiveStart: 'live:start',
  LiveEnd: 'live:end',
  // ---- Commerce ----
  PaymentTip: 'payment:tip',
  PaymentPayoutSelf: 'payment:payout_self',
  PaymentPayoutAny: 'payment:payout_any',
  // ---- Moderation ----
  ModerationView: 'moderation:view',
  ModerationDecide: 'moderation:decide',
  // ---- Admin ----
  AdminImpersonate: 'admin:impersonate',
  AdminFeatureFlag: 'admin:feature_flag',
} as const;

export type Scope = (typeof Scopes)[keyof typeof Scopes];

/**
 * Default scope set per tier. These are the *floor* — additional scopes can be
 * granted by role bindings managed in `access-control-service`.
 */
export const DefaultScopesByTier: Record<Tier, readonly Scope[]> = {
  anonymous: [Scopes.ProfileRead],
  authenticated: [
    Scopes.ProfileRead,
    Scopes.ProfileWriteSelf,
    Scopes.FollowWrite,
    Scopes.PaymentTip,
  ],
  creator: [
    Scopes.ProfileRead,
    Scopes.ProfileWriteSelf,
    Scopes.FollowWrite,
    Scopes.PaymentTip,
    Scopes.VideoUpload,
    Scopes.VideoPublish,
    Scopes.VideoDelete,
    Scopes.LiveStart,
    Scopes.LiveEnd,
    Scopes.PaymentPayoutSelf,
  ],
  partner: [
    Scopes.ProfileRead,
    Scopes.ProfileWriteSelf,
    Scopes.FollowWrite,
    Scopes.PaymentTip,
    Scopes.VideoUpload,
    Scopes.VideoPublish,
    Scopes.VideoDelete,
    Scopes.LiveStart,
    Scopes.LiveEnd,
    Scopes.PaymentPayoutSelf,
  ],
  staff: Object.values(Scopes),
};
