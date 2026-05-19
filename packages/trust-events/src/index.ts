import type { TrustScore, TrustSignalKind, VerificationKind } from '@next/identity-types';

// Topic constants — keep in lockstep with packages/events/src/topics.ts.
export const TopicTrustScoreUpdated = 'trust.score.updated.v1';
export const TopicTrustVerificationGranted = 'trust.verification.granted.v1';
export const TopicTrustVerificationRevoked = 'trust.verification.revoked.v1';

export interface TrustScoreUpdated {
  readonly eventId: string;
  readonly emittedAt: string;
  readonly userId: string;
  readonly previousScore: TrustScore | null;
  readonly newScore: TrustScore;
  readonly signal: TrustSignalKind;
  readonly notes?: string;
}

export interface TrustVerificationGranted {
  readonly eventId: string;
  readonly emittedAt: string;
  readonly userId: string;
  readonly kind: VerificationKind;
  readonly grantedBy: string; // staff user id or "system"
  readonly evidence?: string; // pointer to internal record
}

export interface TrustVerificationRevoked {
  readonly eventId: string;
  readonly emittedAt: string;
  readonly userId: string;
  readonly kind: VerificationKind;
  readonly revokedBy: string;
  readonly reason: string;
}
