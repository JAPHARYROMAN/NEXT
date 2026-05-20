export type EntitlementState =
  | 'entitled'
  | 'not_entitled'
  | 'expired'
  | 'grace'
  | 'pending_payment'
  | 'refund_pending'
  | 'revoked'
  | 'creator_comp';

export interface EntitlementRecord {
  readonly id: string;
  readonly resourceId: string;
  readonly resourceLabel: string;
  readonly state: EntitlementState;
  readonly expiresAt?: string;
  readonly graceEndsAt?: string;
  readonly source?: 'subscription' | 'purchase' | 'sponsorship' | 'comp';
}

export const ENTITLEMENT_LABELS: Record<EntitlementState, string> = {
  entitled: 'Full access',
  not_entitled: 'Preview only',
  expired: 'Access expired',
  grace: 'Grace period',
  pending_payment: 'Payment pending',
  refund_pending: 'Refund in progress',
  revoked: 'Access revoked',
  creator_comp: 'Creator access',
};
