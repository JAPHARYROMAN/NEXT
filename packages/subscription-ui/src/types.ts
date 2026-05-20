export interface MembershipTier {
  readonly id: string;
  readonly name: string;
  readonly priceLabel: string;
  readonly interval: 'month' | 'year';
  readonly description: string;
  readonly benefits: readonly string[];
  readonly highlighted?: boolean;
}

export interface BillingStatus {
  readonly tierName: string;
  readonly renewsAt: string;
  readonly amountLabel: string;
  readonly status: 'active' | 'grace' | 'expired' | 'cancelled_pending';
  readonly cancelAccessible: boolean;
}
