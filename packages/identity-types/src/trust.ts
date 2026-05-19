import type { UserId } from '@next/types';

/** Per-account trust score in [0, 1]. 0.5 is the neutral default for unknowns. */
export type TrustScore = number;

export const VerificationKind = [
  'creator',
  'partner',
  'organization',
  'public_figure',
  'official_account',
] as const;
export type VerificationKind = (typeof VerificationKind)[number];

export interface TrustState {
  readonly userId: UserId;
  readonly score: TrustScore;
  readonly verifications: readonly VerificationKind[];
  readonly updatedAt: string;
}

/** Categories of trust signal — for audit + drift analysis. */
export const TrustSignalKind = [
  'login_anomaly',
  'login_consistency',
  'graph_centrality',
  'content_authenticity',
  'moderation_decision',
  'verification_grant',
  'verification_revoke',
] as const;
export type TrustSignalKind = (typeof TrustSignalKind)[number];
